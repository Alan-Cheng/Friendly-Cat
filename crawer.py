import requests
from xml.etree import ElementTree
import json
import os
import pandas as pd
import re
from pypinyin import lazy_pinyin, Style

# 目標 API 基本 URL
base_url = "https://www.7-11.com.tw/freshfoods/Read_Food_xml_hot.aspx"

# 模擬瀏覽器
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

# 商品分類參數
categories = [
    "19_star", "1_Ricerolls", "16_sandwich", "2_Light", "3_Cuisine",
    "4_Snacks", "5_ForeignDishes", "6_Noodles", "7_Oden", "8_Bigbite",
    "9_Icecream", "10_Slurpee", "11_bread", "hot", "12_steam",
    "13_luwei", "15_health", "17_ohlala", "18_veg", "20_panini", "21_ice", "22_ice"
]

# 初始化列表來存放資料
data = []

# 抓取商品資訊
for index, category in enumerate(categories):
    params = {"": index}  # API 的查詢參數
    response = requests.get(base_url, headers=headers, params=params)

    if response.status_code == 200:
        # 解析 XML 資料
        try:
            root = ElementTree.fromstring(response.content)

            # 抓取商品資料
            for item in root.findall(".//Item"):
                data.append({
                    "category": category,
                    "name": item.findtext("name", ""),
                    "kcal": item.findtext("kcal", ""),
                    "price": item.findtext("price", ""),
                    "image": f'https://www.7-11.com.tw/freshfoods/{category}/' + item.findtext("image", ""),
                    "special_sale": item.findtext("special_sale", ""),
                    "new": item.findtext("new", ""),
                    "content": item.findtext("content", ""),
                })
        except ElementTree.ParseError:
            print(f"分類 {category} 返回非 XML 格式資料。")
    else:
        print(f"分類 {category} 請求失敗，狀態碼: {response.status_code}")

# 將資料儲存為 JSON 檔案，修改路徑到 docs/assets/
output_file = os.path.join(os.getcwd(), 'docs', 'assets', "seven_eleven_products.json")
with open(output_file, "w", encoding="utf-8") as json_file:
    json.dump(data, json_file, ensure_ascii=False, indent=4)

print(f"資料已成功儲存至 JSON 檔案：{output_file}")


# 拼音轉換函數
def get_pinyin(text):
    """
    將中文文字轉換為拼音（不帶聲調）
    例如：'全家田中金斗店' -> 'quan jia tian zhong jin dou dian'
    """
    if not text:
        return ""
    # 使用 lazy_pinyin 轉換，不帶聲調，保留非中文字符
    pinyin_list = lazy_pinyin(text, style=Style.NORMAL)
    return " ".join(pinyin_list)


# API URL
url = 'https://family.map.com.tw/famiport/api/dropdownlist/Select_StoreName'

# 設定 POST 參數
post_data = {
    "store": ""
}

# 發送 POST 請求
response = requests.post(url, json=post_data)

# 檢查是否請求成功
if response.status_code == 200:
    data = response.json()  # 取得 JSON 格式的資料

    # 為每個店家添加拼音欄位
    if isinstance(data, list):
        for store in data:
            if 'Name' in store:
                store['Name_pinyin'] = get_pinyin(store['Name'])
            if 'addr' in store:
                store['addr_pinyin'] = get_pinyin(store['addr'])

    # 設定儲存的路徑，修改為 docs/assets/
    file_path = os.path.join(os.getcwd(), 'docs', 'assets', 'family_mart_stores.json')

    # 確保路徑存在
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    # 將資料儲存為 JSON 文件
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"資料已儲存到 {file_path}（已添加拼音欄位）")
else:
    print("請求失敗，無法取得資料")




# 全家商品資料抓取 - 使用新的 API
family_mart_url = "https://foodsafety.family.com.tw/Web_FFD_2022/ws/QueryFsProductListByFilter"

# POST 請求的 body
family_mart_data = {
    "MEMBER": "N",
    "KEYWORD": "",
    "INCLUDE_CLB": "N"
}

# 發送 POST 請求
family_mart_response = requests.post(family_mart_url, json=family_mart_data, headers=headers)

# 檢查是否請求成功
if family_mart_response.status_code == 200:
    family_mart_json = family_mart_response.json()
    
    # 初始化結果列表
    family_mart_results = []
    
    # 檢查 API 回應是否成功
    if family_mart_json.get("RESULT_CODE") == "00":
        # 遍歷所有分類
        for category_data in family_mart_json.get("LIST", []):
            category_name = category_data.get("CATEGORY_NAME", "")
            
            # 遍歷該分類下的所有商品
            for item in category_data.get("ITEM", []):
                family_mart_results.append({
                    "category": category_name,
                    "title": item.get("PRODNAME", ""),
                    "picture_url": f"https://foodsafety.family.com.tw/product_img/{item.get('PROD_PIC', '')}",
                    "Protein": "",
                    "Carb": "",
                    "Calories": "",
                    "Fat": "",
                    "Description": item.get("NOTE", ""),
                })
        
        # 儲存全家商品資料
        family_mart_output_file = os.path.join(os.getcwd(), 'docs', 'assets', "family_mart_products.json")
        with open(family_mart_output_file, "w", encoding="utf-8") as json_file:
            json.dump(family_mart_results, json_file, ensure_ascii=False, indent=4)
        
        print(f"全家商品資料已成功儲存至：{family_mart_output_file}")
    else:
        print(f"全家 API 請求失敗：{family_mart_json.get('RESULT_DESC', '未知錯誤')}")
else:
    print(f"全家 API 請求失敗，狀態碼: {family_mart_response.status_code}")


import requests
import json
import os
from pypinyin import lazy_pinyin, Style

# 目標 API
city_url = "https://emap.pcsc.com.tw/lib/areacode.js"
store_url = "https://emap.pcsc.com.tw/EMapSDK.aspx"

# 模擬瀏覽器
headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://emap.pcsc.com.tw/emap.aspx",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
}

# 拼音轉換函數
def get_pinyin(text):
    if not text:
        return ""
    return " ".join(lazy_pinyin(text, style=Style.NORMAL))
    
# TWD97 / TM2 投影座標轉 WGS84 經緯度
def convert_tw97_to_wgs84(x, y):
    try:
        lat = float(y) / 1000000
        lng = float(x) / 1000000
        return round(lat, 6), round(lng, 6)
    except:
        return None, None

# 取得所有縣市
r = requests.get(city_url, headers=headers)
groups = [g for g in r.text.split("\n") if "new AreaNode" in g]
city_list = []
for line in groups:
    parts = line.split("'")
    if len(parts) >= 3:
        city_name = parts[1]
        city_code = parts[3]
        city_list.append({"name": city_name, "code": city_code})

# 抓取門市資訊
all_stores = []

for city in city_list:
    # 取得鄉鎮區列表
    post_data = f"commandid=GetTown&cityid={city['code']}&leftMenuChecked="
    # 取得鄉鎮區列表
    r = requests.post(store_url, headers=headers, data=post_data)
    towns = [t.split('</TownName>')[0] for t in r.content.decode('utf-8').split('<TownName>')[1:]]

    for town in towns:
        post_data = f"commandid=SearchStore&city={city['name']}&town={town}"
        r = requests.post(store_url, headers=headers, data=post_data)
        # 解析 GeoPosition
        geo_items = r.text.split('<GeoPosition>')
        for geo in geo_items[1:]:
            try:
                def extract(tag):
                    start = geo.find(f"<{tag}>") + len(f"<{tag}>")
                    end = geo.find(f"</{tag}>")
                    return geo[start:end].strip() if start >= len(f"<{tag}>") else ""

                store = {
                    "serial": extract("POIID"),
                    "name": extract("POIName"),
                    "phone": extract("Telno"),
                    "addr": extract("Address"),
                    "lat": extract("Y"),
                    "lng": extract("X"),
                    "kind": "seven",
                    "name_pinyin": get_pinyin(extract("POIName")),
                    "addr_pinyin": get_pinyin(extract("Address"))
                }
                
                # 轉成正常經緯度
                store["lat"], store["lng"] = convert_tw97_to_wgs84(store["lng"], store["lat"])
                
                all_stores.append(store)
            except:
                continue

# 儲存 JSON
output_file = os.path.join(os.getcwd(), 'docs', 'assets', "seven_eleven_stores.json")
os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_stores, f, ensure_ascii=False, indent=4)

print(f"7-11 門市資訊已儲存至：{output_file}")