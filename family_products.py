"""全家商品爬蟲：CMNO 批次查價及名稱 fallback。"""

import json
import math
import os
from pathlib import Path
import re
import time
import unicodedata
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

FOOD_URL = os.environ.get("FAMILY_FOOD_URL", "")
SEARCH_URL = os.environ.get("FAMILY_SEARCH_URL", "")
HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
}


def normalized_name(name):
    return "".join(
        c for c in unicodedata.normalize("NFKC", name).lower()
        if not c.isspace() and not unicodedata.category(c).startswith("P")
    )

def search_groups(names):
    """先最大化涵蓋商品數；涵蓋數相同時取最長連續字串。"""
    remaining = dict.fromkeys(
        unicodedata.normalize("NFKC", name).strip() for name in names if name.strip()
    )
    candidates = {}
    for name in remaining:
        # 食安名稱的配貨前綴不是商品搜尋關鍵字。
        search_name = re.sub(r"^(?:星[—－-]?)?[一二三四五六日]配", "", name)
        candidates.setdefault(search_name, set()).add(name)
        for start in range(len(search_name)):
            for end in range(start + 2, len(search_name) + 1):
                keyword = search_name[start:end]
                if all(unicodedata.category(c)[0] in "LN" for c in keyword):
                    candidates.setdefault(keyword, set()).add(name)
    groups = []
    while remaining:
        best, covered = "", set()
        for keyword, names_for_keyword in candidates.items():
            matches = names_for_keyword.intersection(remaining)
            if (len(matches), len(keyword)) > (len(covered), len(best)):
                best, covered = keyword, matches
        groups.append({"keyword": best, "names": sorted(covered)})
        for name in covered:
            del remaining[name]
    return groups

def store_products(payload):
    result = payload.get("result")
    if not isinstance(result, dict):
        raise ValueError("Invalid FamilyMart result")
    info = result.get("storeInfo")
    if info is None:
        return []
    if not isinstance(info, dict):
        raise ValueError("Invalid FamilyMart storeInfo")
    products = info.get("product", [])
    if not isinstance(products, list) or any(not isinstance(p, dict) for p in products):
        raise ValueError("Invalid FamilyMart product list")
    return products

def fetch_json(url, data=None):
    request = Request(url, data=data, headers=HEADERS)
    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except (OSError, ValueError) as error:
        # Do not include configured endpoint URLs in logs or tracebacks.
        raise ValueError(f"API 請求失敗 ({type(error).__name__})") from None

def select_products(payload):
    if payload.get("RESULT_CODE") != "00":
        raise ValueError("食安 API 回應失敗")
    products, seen = [], set()
    for category in payload["LIST"]:
        for item in category["ITEM"]:
            product_id = str(item.get("CMNO", ""))
            if not re.fullmatch(r"[0-9]+", product_id) or product_id in seen:
                continue
            seen.add(product_id)
            products.append({
                "id": product_id,
                "category": category.get("CATEGORY_NAME", ""),
                "title": item.get("PRODNAME", ""),
                "picture_url": "https://foodsafety.family.com.tw/product_img/" + item.get("PROD_PIC", ""),
                "Protein": "", "Carb": "", "Calories": "", "Fat": "",
                "Description": item.get("NOTE", ""),
            })
    return products

def merge_prices(products, found):
    by_id = {}
    for item in found:
        product_id = str(item.get("id", "")).removeprefix("product-")
        by_id.setdefault(product_id, []).append(item)
    output = []
    for product in products:
        matches = by_id.get(product["id"], [])
        prices = {valid_price(item) for item in matches if valid_price(item) is not None}
        price = next(iter(prices)) if len(prices) == 1 else None
        matched = next((item for item in matches if valid_price(item) == price), None) if price is not None else None
        output.append({**product, "price": price,
                       "price_source": "id" if matched else None,
                       "price_product_id": product["id"] if matched else None,
                       "price_product_name": matched.get("name") if matched else None})
    return output

def clean_name(name):
    name = unicodedata.normalize("NFKC", name).strip()
    name = re.sub(r"^(?:星[—－-]?)?[一二三四五六日]配", "", name)
    return normalized_name(name)

def valid_price(item):
    raw = item.get("price")
    if isinstance(raw, bool):
        return None
    try:
        price = float(raw)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(price) or price <= 0:
        return None
    return int(price) if price.is_integer() else price

def apply_fallback(output, candidates):
    for product in output:
        if product["price"] is not None:
            continue
        matches = [item for item in candidates if isinstance(item.get("name"), str)
                   and clean_name(item["name"]) == clean_name(product["title"])
                   and str(item.get("id", "")).removeprefix("product-")
                   and valid_price(item) is not None]
        prices = {valid_price(item) for item in matches}
        if len(prices) == 1:
            matched = sorted(matches, key=lambda item: str(item["id"]))[0]
            product.update(price=prices.pop(), price_source="name",
                           price_product_id=str(matched["id"]).removeprefix("product-"),
                           price_product_name=matched["name"])

def fallback(output, delay):
    pending = [p for p in output if p["price"] is None]
    names = list(dict.fromkeys(p["title"] for p in pending))
    groups = search_groups(names)
    queries, candidates, queried = [], [], set()

    def query(keyword):
        if keyword in queried:
            return
        queried.add(keyword)
        time.sleep(delay)
        entry = {"keyword": keyword}
        try:
            raw = fetch_json(SEARCH_URL + "?" + urlencode({"keyword": keyword, "languageCode": "zh-TW"}))
            if raw.get("isSuccess") is not True:
                raise ValueError("搜尋 API 回應失敗")
            items = store_products(raw)
            candidates.extend(items)
            entry.update(response=raw, returned_count=len(items))
        except (OSError, ValueError) as error:
            entry["error"] = str(error)
        queries.append(entry)
        print(f"fallback {keyword}: {entry.get('returned_count', 0)} 筆" + (f"，{entry['error']}" if 'error' in entry else ''), flush=True)

    for group in groups:
        query(group["keyword"])
    apply_fallback(output, candidates)
    # 廣泛關鍵字可能缺漏；僅對仍未找到且未有衝突候選者，補一次完整名稱查詢。
    for name in dict.fromkeys(p["title"] for p in output if p["price"] is None):
        if not any(isinstance(item.get("name"), str) and clean_name(item["name"]) == clean_name(name)
                   and valid_price(item) is not None for item in candidates):
            query(name)
    apply_fallback(output, candidates)
    for product in output:
        if product["price"] is None:
            matches = {valid_price(item) for item in candidates if isinstance(item.get("name"), str)
                       and clean_name(item["name"]) == clean_name(product["title"]) and valid_price(item) is not None}
            product["price_missing_reason"] = "conflicting_prices" if len(matches) > 1 else "no_valid_name_match"
    return queries

def validate_config():
    for name in ("FAMILY_FOOD_URL", "FAMILY_SEARCH_URL"):
        url = urlsplit(os.environ.get(name, ""))
        if url.scheme != "https" or not url.hostname or url.username or url.password or url.query or url.fragment:
            raise ValueError(f"請設定有效的 HTTPS {name} 環境變數（不含查詢參數）")

def crawl_family_products(output_path):
    validate_config()
    payload = fetch_json(FOOD_URL, json.dumps({"MEMBER": "N", "KEYWORD": "", "INCLUDE_CLB": "N"}).encode())
    products = select_products(payload)
    if not products:
        raise ValueError("全家食安列表為空，保留既有商品檔")
    found, failed_batches = [], 0
    batches = [products[start:start + 50] for start in range(0, len(products), 50)]
    for index, batch in enumerate(batches):
        if index:
            time.sleep(1)
        keyword = ",".join("product-" + p["id"] for p in batch)
        try:
            raw = fetch_json(SEARCH_URL + "?" + urlencode({"keyword": keyword, "languageCode": "zh-TW"}))
            if raw.get("isSuccess") is not True:
                raise ValueError("搜尋 API 回應失敗")
            requested = {p["id"] for p in batch}
            items = [p for p in store_products(raw)
                     if str(p.get("id", "")).removeprefix("product-") in requested]
            found.extend(items)
            print(f"全家 ID 批次 {index + 1}/{len(batches)}：送出 {len(batch)}，回傳 {len(items)}")
        except (OSError, ValueError) as error:
            failed_batches += 1
            print(f"全家 ID 批次 {index + 1} 失敗，繼續名稱 fallback：{type(error).__name__}")
    output = merge_prices(products, found)
    id_count = sum(p["price"] is not None for p in output)
    queries = fallback(output, 1)
    summary = {
        "products": len(output), "id_api_calls": len(batches),
        "failed_id_batches": failed_batches, "id_priced": id_count,
        "fallback_api_calls": len(queries),
        "failed_fallback_calls": sum("error" in q for q in queries),
        "fallback_priced": sum(p["price_source"] == "name" for p in output),
        "unpriced": sum(p["price"] is None for p in output),
    }
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(output, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
    temporary.replace(path)
    print("全家商品查價統計：" + json.dumps(summary, ensure_ascii=False))
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as report:
            report.write("### 全家商品查價\n\n| 項目 | 數量 |\n|---|---:|\n")
            for name, value in summary.items():
                report.write(f"| {name} | {value} |\n")
    return output
