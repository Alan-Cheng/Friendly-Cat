"use strict";
(self["webpackChunkfriendly_time"] = self["webpackChunkfriendly_time"] || []).push([["main"],{

/***/ 158:
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppRoutingModule": () => (/* binding */ AppRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _search_food_new_search_new_search_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./search-food/new-search/new-search.component */ 4052);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);




const routes = [
    { path: '**', component: _search_food_new_search_new_search_component__WEBPACK_IMPORTED_MODULE_0__.NewSearchComponent }, // 所有其他路径都重定向到 /search
];
class AppRoutingModule {
}
AppRoutingModule.ɵfac = function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); };
AppRoutingModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule.forRoot(routes), _angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__.RouterModule] }); })();


/***/ }),

/***/ 5041:
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppComponent": () => (/* binding */ AppComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ 124);


class AppComponent {
    constructor() {
        this.title = 'friendly-time';
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(); };
AppComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "router-outlet");
    } }, dependencies: [_angular_router__WEBPACK_IMPORTED_MODULE_1__.RouterOutlet], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ 6747:
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AppModule": () => (/* binding */ AppModule)
/* harmony export */ });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/platform-browser */ 4497);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ 8987);
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app-routing.module */ 158);
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app.component */ 5041);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/select */ 7371);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);
/* harmony import */ var _search_food_search_food_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./search-food/search-food.module */ 8897);
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/platform-browser/animations */ 7146);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);











class AppModule {
}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(); };
AppModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_1__.AppComponent] });
AppModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjector"]({ imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__.BrowserModule,
        _app_routing_module__WEBPACK_IMPORTED_MODULE_0__.AppRoutingModule,
        _search_food_search_food_module__WEBPACK_IMPORTED_MODULE_2__.SearchFoodModule,
        _angular_common_http__WEBPACK_IMPORTED_MODULE_5__.HttpClientModule,
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_6__.BrowserAnimationsModule,
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__.MatFormFieldModule,
        _angular_material_select__WEBPACK_IMPORTED_MODULE_8__.MatSelectModule,
        _angular_material_core__WEBPACK_IMPORTED_MODULE_9__.MatOptionModule,
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_10__.MatProgressSpinnerModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_1__.AppComponent], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__.BrowserModule,
        _app_routing_module__WEBPACK_IMPORTED_MODULE_0__.AppRoutingModule,
        _search_food_search_food_module__WEBPACK_IMPORTED_MODULE_2__.SearchFoodModule,
        _angular_common_http__WEBPACK_IMPORTED_MODULE_5__.HttpClientModule,
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_6__.BrowserAnimationsModule,
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__.MatFormFieldModule,
        _angular_material_select__WEBPACK_IMPORTED_MODULE_8__.MatSelectModule,
        _angular_material_core__WEBPACK_IMPORTED_MODULE_9__.MatOptionModule,
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_10__.MatProgressSpinnerModule] }); })();


/***/ }),

/***/ 3301:
/*!******************************************!*\
  !*** ./src/app/pipes/empty-info.pipe.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EmptyInfoPipe": () => (/* binding */ EmptyInfoPipe)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class EmptyInfoPipe {
    transform(value) {
        // 檢查是否為 null 或 undefined，或者是空字串
        if (value === null || value === undefined || value === '') {
            return '暫無資訊';
        }
        // 否則返回轉為字串的值
        return value.toString();
    }
}
EmptyInfoPipe.ɵfac = function EmptyInfoPipe_Factory(t) { return new (t || EmptyInfoPipe)(); };
EmptyInfoPipe.ɵpipe = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefinePipe"]({ name: "emptyInfo", type: EmptyInfoPipe, pure: true });


/***/ }),

/***/ 8007:
/*!*************************************!*\
  !*** ./src/app/pipes/round.pipe.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RoundPipe": () => (/* binding */ RoundPipe)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class RoundPipe {
    transform(value, precision = 0) {
        // 嘗試將輸入轉換為數字
        const numericValue = parseFloat(value);
        // 檢查是否是有效的數字
        if (isNaN(numericValue)) {
            return value; // 如果不是有效的數字，返回原始輸入
        }
        if (precision === -1) {
            const factor = Math.pow(10, precision); // 計算小數位數
            const roundedValue = Math.round(numericValue * factor) / factor; // 四捨五入到指定精度
            return `${roundedValue} 元`;
        }
        // 判斷數值是否小於 1000
        if (numericValue < 1000) {
            const factor = Math.pow(10, precision); // 計算小數位數
            const roundedValue = Math.round(numericValue * factor) / factor; // 四捨五入到指定精度
            return `${roundedValue} 公尺`; // 返回數字加 ' 公尺'
        }
        else {
            const kilometers = numericValue / 1000; // 將數字轉換為公里
            const roundedKilometers = Math.round(kilometers * 10) / 10; // 四捨五入到小數點後一位
            return `${roundedKilometers} 公里`; // 返回數字加 ' 公里'
        }
    }
}
RoundPipe.ɵfac = function RoundPipe_Factory(t) { return new (t || RoundPipe)(); };
RoundPipe.ɵpipe = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefinePipe"]({ name: "round", type: RoundPipe, pure: true });


/***/ }),

/***/ 6429:
/*!*********************************************************************!*\
  !*** ./src/app/search-food/new-search/display/display.component.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DisplayComponent": () => (/* binding */ DisplayComponent)
/* harmony export */ });
/* harmony import */ var fuse_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! fuse.js */ 6541);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_seven_eleven_request_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/seven-eleven-request.service */ 6325);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/card */ 2156);
/* harmony import */ var _pipes_round_pipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../pipes/round.pipe */ 8007);
/* harmony import */ var _pipes_empty_info_pipe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../pipes/empty-info.pipe */ 3301);








function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, " \u65B0\u54C1 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, " \u7279\u50F9\u4E2D ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div")(1, "div", 21)(2, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3, "\u50F9\u683C(NT$): ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "span", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7, "\u2192");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "span", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](10, "round");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "p", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](13, "emptyInfo");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "p", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](16, "emptyInfo");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
} if (rf & 2) {
    const item_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r10.getFoodDetail711(item_r7).originalPrice);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind2"](10, 4, ctx_r10.getFoodDetail711(item_r7).discountedPrice, -1), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("\u5546\u54C1\u63CF\u8FF0: ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](13, 7, ctx_r10.getFoodDetail711(item_r7).content), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("\u5361\u8DEF\u91CC(kcal): ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](16, 9, ctx_r10.getFoodDetail711(item_r7).kcal), "");
} }
function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div")(1, "div", 21)(2, "p", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3, "\u5546\u54C1\u63CF\u8FF0: \u66AB\u7121\u6B64\u5546\u54C1\u8CC7\u8A0A");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
} }
function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "li")(1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "img", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "div", 12)(4, "div", 13)(5, "h3", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](10, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_10_Template, 2, 0, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](11, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_11_Template, 2, 0, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](12, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_12_Template, 17, 11, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](13, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_div_13_Template, 4, 0, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
} if (rf & 2) {
    const item_r7 = ctx.$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("src", ctx_r6.getFoodDetail711(item_r7).image, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"])("alt", ctx_r6.getFoodDetail711(item_r7).name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", item_r7.ItemName, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" \u5269\u9918\u6578\u91CF: ", item_r7.RemainingQty, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r6.getFoodDetail711(item_r7).new === "True");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r6.getFoodDetail711(item_r7).special_sale === "True");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r6.getFoodDetail711(item_r7).image !== "assets/\u6B64\u5546\u54C1\u66AB\u7121\u5716\u7247.png");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r6.getFoodDetail711(item_r7).image === "assets/\u6B64\u5546\u54C1\u66AB\u7121\u5716\u7247.png");
} }
function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 6)(1, "div", 7)(2, "h3", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "ul", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_li_5_Template, 14, 8, "li", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
} if (rf & 2) {
    const subCategory_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", subCategory_r4.Name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r5.itemsBySubCategory[subCategory_r4.Name]);
} }
function DisplayComponent_mat_card_0_ng_container_1_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_div_1_Template, 6, 2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const subCategory_r4 = ctx.$implicit;
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r3.itemsBySubCategory[subCategory_r4.Name] && ctx_r3.itemsBySubCategory[subCategory_r4.Name].length > 0);
} }
function DisplayComponent_mat_card_0_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "h2", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, DisplayComponent_mat_card_0_ng_container_1_ng_container_3_Template, 2, 1, "ng-container", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r1.category.Name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r1.subCategories);
} }
function DisplayComponent_mat_card_0_ng_container_2_ng_container_3_div_1_li_5_div_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div")(1, "p", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](3, "emptyInfo");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "p", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](6, "emptyInfo");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
} if (rf & 2) {
    const item_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("\u5546\u54C1\u63CF\u8FF0: ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](3, 2, ctx_r19.getFoodDetailFamilyMart(item_r18).Description), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("\u5361\u8DEF\u91CC(kcal): ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](6, 4, ctx_r19.getFoodDetailFamilyMart(item_r18).Calories), "");
} }
function DisplayComponent_mat_card_0_ng_container_2_ng_container_3_div_1_li_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "li")(1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "img", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "div", 12)(4, "div", 13)(5, "h3", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](9, DisplayComponent_mat_card_0_ng_container_2_ng_container_3_div_1_li_5_div_9_Template, 7, 6, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
} if (rf & 2) {
    const item_r18 = ctx.$implicit;
    const ctx_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("src", ctx_r17.getFoodDetailFamilyMart(item_r18).picture_url, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"])("alt", ctx_r17.getFoodDetailFamilyMart(item_r18).title);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", item_r18.ItemName, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" \u5269\u9918\u6578\u91CF: ", item_r18.RemainingQty, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r17.getFoodDetailFamilyMart(item_r18).picture_url !== "assets/\u6B64\u5546\u54C1\u66AB\u7121\u5716\u7247.png");
} }
function DisplayComponent_mat_card_0_ng_container_2_ng_container_3_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 6)(1, "div", 7)(2, "h3", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "ul", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, DisplayComponent_mat_card_0_ng_container_2_ng_container_3_div_1_li_5_Template, 10, 5, "li", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
} if (rf & 2) {
    const subCategory_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", subCategory_r15.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r16.itemsBySubCategory[subCategory_r15.name]);
} }
function DisplayComponent_mat_card_0_ng_container_2_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, DisplayComponent_mat_card_0_ng_container_2_ng_container_3_div_1_Template, 6, 2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const subCategory_r15 = ctx.$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r14.itemsBySubCategory[subCategory_r15.name] && ctx_r14.itemsBySubCategory[subCategory_r15.name].length > 0);
} }
function DisplayComponent_mat_card_0_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "h2", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, DisplayComponent_mat_card_0_ng_container_2_ng_container_3_Template, 2, 1, "ng-container", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r2.category.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r2.subCategories);
} }
function DisplayComponent_mat_card_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-card", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, DisplayComponent_mat_card_0_ng_container_1_Template, 4, 2, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, DisplayComponent_mat_card_0_ng_container_2_Template, 4, 2, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.category.Name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.category.name);
} }
class DisplayComponent {
    constructor(sevenElevenRequestService) {
        this.sevenElevenRequestService = sevenElevenRequestService;
        this.subCategories = [];
        this.itemsBySubCategory = {}; // 儲存每個子分類的商品列表
    }
    ngOnInit() { }
    ngOnChanges(changes) {
        // 若組件輸入有變化時，重新載入子商品列表
        if (changes['category'] || changes['store']) {
            this.loadSubCategories(); // 重新加載子分類資料
        }
    }
    loadSubCategories() {
        if (this.store && this.category) {
            if (this.store.StoreName) {
                this.subCategories = this.category.Children; // 更新子分類列表
                this.loadItemsBySubCategory(); // 載入子分類下的所有商品資料
            }
            else if (this.store.name) {
                this.subCategories = this.category.categories;
                // 全家直接把商品丟進itemsBySubCategory
                var items = [];
                this.subCategories.forEach((cat) => {
                    items.push(...cat.products.map((product) => ({
                        ItemName: product.name,
                        RemainingQty: product.qty, // 映射到 RemainingQty
                    })));
                    this.itemsBySubCategory[cat.name] = items || [];
                    items = [];
                });
            }
        }
    }
    loadItemsBySubCategory() {
        if (this.store) {
            this.sevenElevenRequestService.getItemsByStoreNo(this.store.StoreNo).subscribe(response => {
                if (response.isSuccess && response.element.StoreStockItem) {
                    const categoryStockItems = response.element.StoreStockItem.CategoryStockItems;
                    this.subCategories.forEach(subCategory => {
                        const items = [];
                        // 遍歷 CategoryStockItems，根據子分類名稱過濾並提取 ItemList
                        categoryStockItems.forEach(category => {
                            if (category.Name === subCategory.Name) {
                                items.push(...category.ItemList);
                            }
                        });
                        // 把結果保存到 itemsBySubCategory
                        this.itemsBySubCategory[subCategory.Name] = items || [];
                    });
                }
            });
        }
    }
    // getSubCategoryQty(subCategoryName: string): number {
    //   let qty = 0;
    //   const items = this.itemsBySubCategory[subCategoryName];
    //   if (items) {
    //     items.forEach(item => {
    //       qty += item.RemainingQty;
    //     });
    //   }
    //   return qty;
    // }
    getDiscountedPrice(originalPrice) {
        // 解析原價
        const price = parseFloat(originalPrice.replace('NT$', '').trim());
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        let discountedPrice = price;
        // 設定折扣邏輯
        if (currentHour >= 19 && currentHour < 20) {
            discountedPrice *= 0.8; // 19:00~19:59 八折
        }
        else if ((currentHour >= 10 && currentHour < 18) || (currentHour >= 20 || currentHour < 3)) {
            discountedPrice *= 0.65; // 10:00~17:59 以及 20:00~03:00 六五折
        }
        else {
            // 待查清其餘時段是幾折==，目前假設八折
            discountedPrice *= 0.8;
        }
        return discountedPrice.toString();
    }
    getFoodDetail711(item) {
        // 設置 Fuse.js 配置選項
        const options = {
            includeScore: true,
            threshold: 0.3,
            keys: ['name'] // 搜尋的欄位是 'name'
        };
        // 初始化 Fuse 進行模糊搜尋
        const fuse = new fuse_js__WEBPACK_IMPORTED_MODULE_4__["default"](this.foodDetails, options);
        // 查找最匹配的項目
        const result = fuse.search(item.ItemName);
        // 如果找到匹配項，則返回最相似的那個
        const foodDetail = result.length > 0 ? result[0].item : {
            category: '',
            content: '',
            image: 'assets/此商品暫無圖片.png',
            kcal: '',
            name: '',
            new: 'False',
            price: '',
            special_sale: 'False'
        };
        // 計算折扣後的價格
        const discountedPrice = this.getDiscountedPrice(foodDetail.price);
        // 將計算結果新增到 foodDetail 物件中
        foodDetail['discountedPrice'] = discountedPrice;
        foodDetail['originalPrice'] = foodDetail.price; // 原價
        return foodDetail;
    }
    getFoodDetailFamilyMart(item) {
        // 設置 Fuse.js 配置選項
        const options = {
            includeScore: true,
            threshold: 0.3,
            keys: ['title']
        };
        // 初始化 Fuse 進行模糊搜尋
        const fuse = new fuse_js__WEBPACK_IMPORTED_MODULE_4__["default"](this.foodDetails, options);
        // 查找最匹配的項目
        const result = fuse.search(item.ItemName);
        // 如果找到匹配項，則返回最相似的那個
        const foodDetail = result.length > 0 ? result[0].item :
            {
                "category": "",
                "title": "",
                "picture_url": "assets/此商品暫無圖片.png",
                "Protein (g)": '',
                "Carb (g)": '',
                "Calories (kcal)": '',
                "Fat (g)": '',
                "Description": ""
            };
        return foodDetail;
    }
}
DisplayComponent.ɵfac = function DisplayComponent_Factory(t) { return new (t || DisplayComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_seven_eleven_request_service__WEBPACK_IMPORTED_MODULE_0__.SevenElevenRequestService)); };
DisplayComponent.ɵcmp = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: DisplayComponent, selectors: [["app-display"]], inputs: { store: "store", category: "category", foodDetails: "foodDetails" }, features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵNgOnChangesFeature"]], decls: 1, vars: 1, consts: [["class", "border-gray-300", 4, "ngIf"], [1, "border-gray-300"], [4, "ngIf"], [1, "text-2xl", "font-bold", "mb-4"], [4, "ngFor", "ngForOf"], ["class", "sub-category-item bg-white border border-gray-300 p-6 mb-8 rounded-lg shadow-lg", 4, "ngIf"], [1, "sub-category-item", "bg-white", "border", "border-gray-300", "p-6", "mb-8", "rounded-lg", "shadow-lg"], [1, "mb-4"], [1, "text-2xl", "font-bold", "text-gray-800"], [1, "space-y-6", "sm:space-y-4"], [1, "food-item", "flex", "flex-col", "sm:flex-row", "items-start", "p-4", "border", "border-gray-200", "rounded-lg", "shadow-sm", "hover:shadow-md", "transition-shadow"], [1, "object-contain", "rounded-lg", "mb-4", "sm:mb-0", "sm:mr-6", "shadow-md", "w-24", "h-24", "sm:w-32", "sm:h-32", 3, "src", "alt"], [1, "flex-1"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "sm:justify-between", "mb-2"], [1, "text-sm", "sm:text-lg", "font-semibold", "text-gray-800"], [1, "inline-block", "bg-green-100", "text-green-800", "text-xs", "sm:text-sm", "font-semibold", "px-4", "py-2", "rounded-full"], [1, "flex", "space-x-2", "mb-2"], ["class", "inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full", 4, "ngIf"], ["class", "inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full", 4, "ngIf"], [1, "inline-block", "bg-red-100", "text-red-800", "text-xs", "font-semibold", "px-3", "py-1", "rounded-full"], [1, "inline-block", "bg-yellow-100", "text-yellow-800", "text-xs", "font-semibold", "px-3", "py-1", "rounded-full"], [1, "text-sm", "sm:text-base", "font-semibold", "text-gray-800", "mb-2"], [1, "text-gray-800"], [1, "line-through", "text-gray-500"], [1, "text-red-600", "mx-2"], [1, "text-red-600"], [1, "text-xs", "sm:text-sm", "text-gray-500", "mb-1"]], template: function DisplayComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, DisplayComponent_mat_card_0_Template, 3, 2, "mat-card", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.subCategories.length > 0);
    } }, dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgIf, _angular_material_card__WEBPACK_IMPORTED_MODULE_6__.MatCard, _pipes_round_pipe__WEBPACK_IMPORTED_MODULE_1__.RoundPipe, _pipes_empty_info_pipe__WEBPACK_IMPORTED_MODULE_2__.EmptyInfoPipe], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJkaXNwbGF5LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ 4052:
/*!****************************************************************!*\
  !*** ./src/app/search-food/new-search/new-search.component.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NewSearchComponent": () => (/* binding */ NewSearchComponent)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ 2340);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs */ 9337);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs */ 745);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs */ 2673);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs */ 3158);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! rxjs */ 9346);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! rxjs */ 1640);
/* harmony import */ var geolib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! geolib */ 2727);
/* harmony import */ var geolib__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(geolib__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common/http */ 8987);
/* harmony import */ var src_app_services_geolocation_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/geolocation.service */ 4375);
/* harmony import */ var _services_seven_eleven_request_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./services/seven-eleven-request.service */ 6325);
/* harmony import */ var _services_family_mart_request_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./services/family-mart-request.service */ 4107);
/* harmony import */ var _services_loading_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../services/loading.service */ 4471);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/autocomplete */ 8550);
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/button */ 4522);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _display_display_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./display/display.component */ 6429);
/* harmony import */ var _pipes_round_pipe__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../pipes/round.pipe */ 8007);






















function NewSearchComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, " \u770B\u770B\u9644\u8FD1\u6709\u5565\u597D\u5403\u7684\u5427\uFF01 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function NewSearchComponent_mat_progress_spinner_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](0, "mat-progress-spinner", 18);
  }
}

function NewSearchComponent_mat_option_20_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "img", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
  }

  if (rf & 2) {
    const store_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate"]("src", ctx_r6.sevenElevenIconUrl, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("", store_r5.name, "\u9580\u5E02");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](store_r5.addr);
  }
}

function NewSearchComponent_mat_option_20_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "img", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
  }

  if (rf & 2) {
    const store_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate"]("src", ctx_r7.familyMartIconUrl, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("", store_r5.name.replace("\u5E97", ""), "\u9580\u5E02");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](store_r5.addr);
  }
}

function NewSearchComponent_mat_option_20_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "mat-option", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, NewSearchComponent_mat_option_20_div_1_Template, 6, 3, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](2, NewSearchComponent_mat_option_20_div_2_Template, 6, 3, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const store_r5 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("value", store_r5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r5.label === "7-11");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r5.label === "\u5168\u5BB6");
  }
}

function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_span_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](2, "round");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](3).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("\u8DDD\u96E2\u60A8: ", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind2"](2, 1, store_r11.distance, 1), "");
  }
}

function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_span_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "\u53EF\u67E5\u770B\u5730\u5716\uFF1A");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

const _c0 = function (a0) {
  return {
    "opacity": a0
  };
};

function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_ng_container_13_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_ng_container_13_div_1_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r25);
      const category_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
      const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](3).$implicit;
      const ctx_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r23.toggleSubCategoryDetails(store_r11, category_r20));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "img", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div")(3, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
  }

  if (rf & 2) {
    const category_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](3).$implicit;
    const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassMapInterpolate1"]("category border p-2 sm:p-3 md:p-4 rounded-lg text-center cursor-pointer w-full sm:w-full md:w-full\n                      ", ctx_r22.selectedCategory === category_r20 && ctx_r22.selectedStore === store_r11 ? "bg-blue-100" : "", "");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("pointer-events-none", ctx_r22.getSubCategoryTotalQty(store_r11, category_r20) === 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate"]("alt", category_r20.Name);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("src", category_r20.ImageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"])("ngStyle", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](10, _c0, ctx_r22.getSubCategoryTotalQty(store_r11, category_r20) === 0 ? 0.3 : 1));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](category_r20.Name);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", ctx_r22.getSubCategoryTotalQty(store_r11, category_r20), " ");
  }
}

function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_ng_container_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_ng_container_13_div_1_Template, 7, 12, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const category_r20 = ctx.$implicit;
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](3).$implicit;
    const ctx_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r17.getSubCategoryTotalQty(store_r11, category_r20) > 0);
  }
}

function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_div_15_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "app-display", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("store", ctx_r18.selectedStore)("category", ctx_r18.selectedCategory)("foodDetails", ctx_r18.foodDetails711);
  }
}

function NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](2, "img", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "h2", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 31)(6, "h4", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](7, NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_span_7_Template, 3, 4, "span", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](8, NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_span_8_Template, 2, 0, "span", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](9, "a", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](10, "img", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](11, "div", 35)(12, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](13, NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_ng_container_13_Template, 2, 1, "ng-container", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](14, "slice");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](15, NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_div_15_Template, 2, 3, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2).$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("src", ctx_r14.sevenElevenIconUrl, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("7-11", store_r11.StoreName, "\u9580\u5E02");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r11.showDistance);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !store_r11.showDistance);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate1"]("href", "https://www.google.com/maps/search/7-ELEVEN", store_r11.StoreName, "\u9580\u5E02", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind3"](14, 7, ctx_r14.foodCategories, 0, 10));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r14.selectedCategory && ctx_r14.selectedStore === store_r11);
  }
}

function NewSearchComponent_div_25_ng_container_1_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, NewSearchComponent_div_25_ng_container_1_div_1_ng_container_1_Template, 16, 11, "ng-container", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r11.label === "7-11" && store_r11.RemainingQty > 0);
  }
}

function NewSearchComponent_div_25_ng_container_1_div_2_span_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](2, "round");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("\u8DDD\u96E2\u60A8: ", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind2"](2, 1, store_r11.distance, 1), "");
  }
}

function NewSearchComponent_div_25_ng_container_1_div_2_span_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "\u53EF\u67E5\u770B\u5730\u5716\uFF1A");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function NewSearchComponent_div_25_ng_container_1_div_2_div_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r41 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function NewSearchComponent_div_25_ng_container_1_div_2_div_13_Template_div_click_0_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r41);
      const category_r37 = restoredCtx.$implicit;
      const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2).$implicit;
      const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r39.toggleSubCategoryDetails(store_r11, category_r37));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "img", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div")(3, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
  }

  if (rf & 2) {
    const category_r37 = ctx.$implicit;
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2).$implicit;
    const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassMapInterpolate1"]("category border p-2 sm:p-3 md:p-4 rounded-lg text-center cursor-pointer w-full sm:w-full md:w-full\n              ", ctx_r34.selectedCategory === category_r37 && ctx_r34.selectedStore === store_r11 ? "bg-blue-100" : "", "");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("pointer-events-none", ctx_r34.getFSubCategoryQty(store_r11, category_r37) === 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate"]("alt", ctx_r34.getFCatName(category_r37));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("src", ctx_r34.getFUrl(category_r37), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"])("ngStyle", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](10, _c0, ctx_r34.getFSubCategoryQty(store_r11, category_r37) === 0 ? 0.3 : 1));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](ctx_r34.getFCatName(category_r37));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", ctx_r34.getFSubCategoryQty(store_r11, category_r37), " ");
  }
}

function NewSearchComponent_div_25_ng_container_1_div_2_div_15_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "app-display", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("store", ctx_r35.selectedStore)("category", ctx_r35.selectedCategory)("foodDetails", ctx_r35.foodDetailsFamilyMart);
  }
}

function NewSearchComponent_div_25_ng_container_1_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](3, "img", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "h2", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "div", 31)(7, "h4", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](8, NewSearchComponent_div_25_ng_container_1_div_2_span_8_Template, 3, 4, "span", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](9, NewSearchComponent_div_25_ng_container_1_div_2_span_9_Template, 2, 0, "span", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "a", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](11, "img", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](13, NewSearchComponent_div_25_ng_container_1_div_2_div_13_Template, 7, 12, "div", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](14, "slice");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](15, NewSearchComponent_div_25_ng_container_1_div_2_div_15_Template, 2, 3, "div", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const store_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("src", ctx_r13.familyMartIconUrl, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](store_r11.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r11.showDistance);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !store_r11.showDistance);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpropertyInterpolate1"]("href", "https://www.google.com/maps/search/\u5168\u5BB6\u4FBF\u5229\u5546\u5E97", ctx_r13.fStoreName(store_r11.name), "", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind3"](14, 7, store_r11.info, 0, 10));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r13.selectedCategory && ctx_r13.selectedStore === store_r11);
  }
}

function NewSearchComponent_div_25_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, NewSearchComponent_div_25_ng_container_1_div_1_Template, 2, 1, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](2, NewSearchComponent_div_25_ng_container_1_div_2_Template, 16, 11, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const store_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r11.RemainingQty > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", store_r11.label === "\u5168\u5BB6");
  }
}

function NewSearchComponent_div_25_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, NewSearchComponent_div_25_ng_container_1_Template, 3, 2, "ng-container", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", ctx_r4.totalStoresShowList);
  }
}

class NewSearchComponent {
  constructor(http, geolocationService, sevenElevenService, familyMartService, loadingService) {
    this.http = http;
    this.geolocationService = geolocationService;
    this.sevenElevenService = sevenElevenService;
    this.familyMartService = familyMartService;
    this.loadingService = loadingService;
    this.searchTerm = '';
    this.searchSelectedStore = null;
    this.selectedStoreName = '';
    this.foodDetails711 = [];
    this.foodDetailsFamilyMart = [];
    this.storeFilter = 'all';
    this.dropDown711List = [];
    this.dropDownFamilyMartList = [];
    this.unifiedDropDownList = [];
    this.sevenElevenIconUrl = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.icon;
    this.familyMartIconUrl = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.familyMartUrl.icon;
    this.zipcodes = []; // 原始 API 資料

    this.cities = []; // 縣市清單

    this.filteredDistricts = []; // 篩選後的行政區列表

    this.zipcodeList = [];
    this.selectedCity = null; // 選擇的縣市

    this.selectedDistrict = null; // 選擇的行政區

    this.selectedZipcode = null; // 對應的郵遞區號

    this.foodCategories = [];
    this.nearby711Stores = []; // 儲存用現在位置找到的711

    this.nearbyFamilyMartStores = []; // 儲存用現在位置找到的全家

    this.totalStoresShowList = []; //為了方便顯示所以統一

    this.filteredStoresList = []; // 用來儲存篩選後的商店列表

    this.searchForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_9__.FormGroup({
      selectedStoreName: new _angular_forms__WEBPACK_IMPORTED_MODULE_9__.FormControl('') // 控制選中的商店

    });
  }

  ngOnInit() {
    this.init();
  }

  getCityName() {
    const apiUrl = 'https://demeter.5fpro.com/tw/zipcodes.json'; // API URL

    return this.http.get(apiUrl).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_10__.tap)(data => {
      this.zipcodes = data;
      this.cities = [...new Set(data.map(item => item.city_name))];
      this.zipcodeList = [...new Set(data.map(item => item.zipcode))];
    }));
  } // 當縣市選擇改變時


  onCityChange(city) {
    // 根據選擇的縣市篩選行政區
    this.filteredDistricts = this.zipcodes.filter(item => item.city_name === city);
    this.selectedDistrict = null; // 清空選中的行政區

    this.selectedZipcode = null; // 清空郵遞區號
  } // 當行政區選擇改變時


  onDistrictChange(zipcode) {
    // 更新選擇的郵遞區號
    this.selectedZipcode = zipcode;
  }

  handleError(error) {
    switch (error.code) {
      case 1:
        return '使用者拒絕位置存取';

      case 2:
        return '無法取得位置資訊';

      case 3:
        return '位置請求逾時';

      default:
        return '未知錯誤';
    }
  }

  init() {
    // // 使用 from 將 Promise 轉換為 Observable
    // this.getCityName();
    this.loadingService.show(); // 显示加载动画
    // 取得711跟全家的商品詳細資訊

    this.sevenElevenService.getFoodDetails().subscribe(data => {
      this.foodDetails711 = data;
    });
    this.familyMartService.getFoodDetails().subscribe(data => {
      this.foodDetailsFamilyMart = data;
    }); //取得所有全家商店名稱資訊

    this.getFamilyMartAllStore();
    (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)(true).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(() => {
      return this.sevenElevenService.getAccessToken();
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(token => {
      if (token && token.element) {
        sessionStorage.setItem('711Token', token.element);
        console.log('Stored 711Token'); // 如果 token 儲存成功，發送 getFoodCategory 請求

        return this.sevenElevenService.getFoodCategory();
      } else {
        // 如果 token 沒有成功返回，返回空陣列
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
      }
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_13__.catchError)(error => {
      // 錯誤處理邏輯
      console.error('Error:', error);
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]); // 在出錯時返回空陣列，防止應用崩潰
    })).subscribe(res => {
      if (res && res.element) {
        this.foodCategories = res.element;
        this.loadingService.hide();
      } else {
        console.error('Failed to fetch food categories');
        this.loadingService.hide();
      }
    });
  }

  getFamilyMartAllStore() {
    this.familyMartService.getStores().subscribe(data => {
      if (data.length > 0) {
        this.dropDownFamilyMartList = data;
      }
    });
  }

  getFoodSubCategoryImage(nodeID) {
    // 查找匹配的子分類
    for (let category of this.foodCategories) {
      const subCategory = category.Children.find(child => child.ID === nodeID);

      if (subCategory) {
        // 找到對應的子分類並返回其對應的分類圖片 URL
        return category.ImageUrl;
      }
    } // 如果沒有找到對應的子分類，返回 null


    return null;
  }

  getSubCategoryTotalQty(store, category) {
    let totalQty = 0; // 遍歷商店中的所有商品，檢查是否屬於當前分類及子分類

    for (const stockItem of store.CategoryStockItems) {
      // 遍歷每個分類的子項目，檢查是否屬於這個 category
      for (const child of category.Children) {
        if (stockItem.NodeID === child.ID) {
          totalQty += stockItem.RemainingQty;
        }
      }
    }

    return totalQty;
  } // 當用戶點擊某個分類時，切換選中的分類與店鋪


  toggleSubCategoryDetails(store, category) {
    this.selectedCategory = category;
    this.selectedStore = store;
  } // 這寫的真他媽醜到爆


  onInput(event) {
    const input = event.target.value; // 確保這裡的值是有效的

    if (input.length >= 2) {
      this.loadingService.show();
      this.unifiedDropDownList = []; // 要先取得所在位置用於後續下拉選單搜尋排序

      if (!this.latitude && !this.longitude) {
        (0,rxjs__WEBPACK_IMPORTED_MODULE_14__.from)(this.geolocationService.getCurrentPosition()).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.latitude = lat;
          this.longitude = lng;
          console.log('已取得位置');
          return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
        }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(() => {
          return this.sevenElevenService.getAccessToken();
        }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(token => {
          if (token && token.element) {
            sessionStorage.setItem('711Token', token.element);
            return this.sevenElevenService.getStoreByAddress(input);
          } else {
            return [];
          }
        })).subscribe(data => {
          if (data && data.isSuccess) {
            this.dropDown711List = data.element; // 刪掉全家兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input

            const filteredDropDownFamilyMartList = this.dropDownFamilyMartList.map(item => ({ ...item,
              Name: item.Name.replace('全家', '') // 去除 "全家" 字串

            })).filter(item => item.Name.includes(input) || item.addr.includes(input)); // 刪掉711兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input

            const filteredDropDown711List = this.dropDown711List.map(item => ({ ...item,
              Name: item.StoreName.replace('711', '') // 去除 "全家" 字串

            })).filter(item => item.Name.includes(input) || item.Address.includes(input)); // 統一兩個列表的名稱欄位

            const normalizedFamilyMartList = filteredDropDownFamilyMartList.map(item => ({
              name: item.Name,
              addr: item.addr,
              label: '全家',
              longitude: item.px_wgs84,
              latitude: item.py_wgs84
            }));
            const normalized711List = filteredDropDown711List.map(item => ({
              name: item.StoreName,
              addr: item.Address,
              label: '7-11',
              longitude: item.Longitude,
              latitude: item.Latitude
            }));
            normalized711List.forEach(item => {
              if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                this.unifiedDropDownList.push(item); // 只有當 unifedDropDownList 中沒有該元素時才添加
              }
            });
            normalizedFamilyMartList.forEach(item => {
              if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                this.unifiedDropDownList.push(item); // 只有當 unifedDropDownList 中沒有該元素時才添加
              }
            }); // 按照經緯度算出距離排序unifiedDropDownList

            const nameGroup = this.unifiedDropDownList.filter(item => item.name.includes(input)) // 篩選 name 包含 input 的元素
            .sort((a, b) => {
              const distanceA = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: a.latitude,
                longitude: a.longitude
              });
              const distanceB = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: b.latitude,
                longitude: b.longitude
              });
              return distanceA - distanceB; // 按距離升序排序
            });
            const addrGroup = this.unifiedDropDownList.filter(item => item.addr.includes(input) && !nameGroup.includes(item)) // 篩選 addr 包含 input 的元素，排除已在 nameGroup 的元素
            .sort((a, b) => {
              const distanceA = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: a.latitude,
                longitude: a.longitude
              });
              const distanceB = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: b.latitude,
                longitude: b.longitude
              });
              return distanceA - distanceB; // 按距離升序排序
            });
            this.unifiedDropDownList = [...nameGroup, ...addrGroup];
            this.loadingService.hide();
          }
        }, error => {
          console.error('API 請求錯誤:', error);
          this.loadingService.hide();
        });
      } else {
        (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)(true).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(() => {
          return this.sevenElevenService.getAccessToken();
        }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(token => {
          if (token && token.element) {
            sessionStorage.setItem('711Token', token.element);
            return this.sevenElevenService.getStoreByAddress(input);
          } else {
            return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
          }
        })).subscribe(data => {
          if (data && data.isSuccess) {
            this.dropDown711List = data.element; // 刪掉全家兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input

            const filteredDropDownFamilyMartList = this.dropDownFamilyMartList.map(item => ({ ...item,
              Name: item.Name.replace('全家', '') // 去除 "全家" 字串

            })).filter(item => item.Name.includes(input) || item.addr.includes(input)); // 刪掉711兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input

            const filteredDropDown711List = this.dropDown711List.map(item => ({ ...item,
              Name: item.StoreName.replace('711', '') // 去除 "全家" 字串

            })).filter(item => item.Name.includes(input) || item.Address.includes(input)); // 統一兩個列表的名稱欄位

            const normalizedFamilyMartList = filteredDropDownFamilyMartList.map(item => ({
              name: item.Name,
              addr: item.addr,
              label: '全家',
              longitude: item.px_wgs84,
              latitude: item.py_wgs84
            }));
            const normalized711List = filteredDropDown711List.map(item => ({
              name: item.StoreName,
              addr: item.Address,
              label: '7-11',
              longitude: item.Longitude,
              latitude: item.Latitude
            }));
            normalized711List.forEach(item => {
              if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                this.unifiedDropDownList.push(item); // 只有當 unifedDropDownList 中沒有該元素時才添加
              }
            });
            normalizedFamilyMartList.forEach(item => {
              if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                this.unifiedDropDownList.push(item); // 只有當 unifedDropDownList 中沒有該元素時才添加
              }
            });
            const nameGroup = this.unifiedDropDownList.filter(item => item.name.includes(input)) // 篩選 name 包含 input 的元素
            .sort((a, b) => {
              const distanceA = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: a.latitude,
                longitude: a.longitude
              });
              const distanceB = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: b.latitude,
                longitude: b.longitude
              });
              return distanceA - distanceB; // 按距離升序排序
            });
            const addrGroup = this.unifiedDropDownList.filter(item => item.addr.includes(input) && !nameGroup.includes(item)) // 篩選 addr 包含 input 的元素，排除已在 nameGroup 的元素
            .sort((a, b) => {
              const distanceA = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: a.latitude,
                longitude: a.longitude
              });
              const distanceB = (0,geolib__WEBPACK_IMPORTED_MODULE_1__.getDistance)({
                latitude: this.latitude,
                longitude: this.longitude
              }, {
                latitude: b.latitude,
                longitude: b.longitude
              });
              return distanceA - distanceB; // 按距離升序排序
            });
            this.unifiedDropDownList = [...nameGroup, ...addrGroup];
            this.loadingService.hide();
          }
        }, error => {
          console.error('API 請求錯誤:', error);
          this.loadingService.hide();
        });
      }
    } else {
      this.unifiedDropDownList = [];
    }
  }

  onOptionSelect(event) {
    // 從選中的選項中獲取值
    this.searchSelectedStore = event.option.value.name;
    this.searchTerm = event.option.value.label + event.option.value.name.replace('店', '') + '門市';
    const label = event.option.value.label;
    const storeName = event.option.value.name;
    const storeLongitude = Number(event.option.value.longitude);
    const storeLatitude = Number(event.option.value.latitude);
    console.log('Store Type:', label);
    console.log('Store Name:', storeName);
    console.log('Store Longitude:', storeLongitude);
    console.log('Store Latitude:', storeLatitude);
    console.log('Selected Option:', event.option.value);
    this.loadingService.show();
    (0,rxjs__WEBPACK_IMPORTED_MODULE_14__.from)(this.geolocationService.getCurrentPosition()).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      this.latitude = lat;
      this.longitude = lng;
      console.log('已取得位置');
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(res => {
      if (res) {
        return this.sevenElevenService.getAccessToken();
      } else {
        return [];
      }
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(token => {
      if (token && token.element) {
        sessionStorage.setItem('711Token', token.element);
        console.log('Stored 711Token'); // 如果 token 儲存成功，發送 getFoodCategory 請求

        return this.sevenElevenService.getFoodCategory();
      } else {
        // 如果 token 沒有成功返回，返回空陣列
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
      }
    })).subscribe(res => {
      if (res) {
        this.searchCombineAndTransformStores(storeLatitude, storeLongitude);
        this.loadingService.hide();
      } else {
        console.error('Failed to fetch food categories');
        this.loadingService.hide();
      }
    });
  }

  onSubmit() {
    console.log('搜尋店家:', this.searchSelectedStore);
    alert('此功能將於近期開放！');
  }

  onUseCurrentLocation() {
    this.loadingService.show();
    (0,rxjs__WEBPACK_IMPORTED_MODULE_14__.from)(this.geolocationService.getCurrentPosition()).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      this.latitude = lat;
      this.longitude = lng;
      console.log('已取得位置');
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(res => {
      if (res) {
        return this.sevenElevenService.getAccessToken();
      } else {
        return [];
      }
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.switchMap)(token => {
      if (token && token.element) {
        sessionStorage.setItem('711Token', token.element);
        console.log('Stored 711Token'); // 如果 token 儲存成功，發送 getFoodCategory 請求

        return this.sevenElevenService.getFoodCategory();
      } else {
        // 如果 token 沒有成功返回，返回空陣列
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)([]);
      }
    })).subscribe(res => {
      if (res) {
        this.searchCombineAndTransformStores();
        this.loadingService.hide();
      } else {
        console.error('Failed to fetch food categories');
        this.loadingService.hide();
      }
    });
  }

  combineStoreList(storeLatitude, storeLongitude) {
    // 清空統一列表，避免重複累加
    this.totalStoresShowList = []; // 處理7-11商店

    this.nearby711Stores.forEach(store => {
      const transformedStore = { ...store,
        label: '7-11',
        distance: store.Distance,
        remainingQty: store.RemainingQty,
        showDistance: true
      };
      this.totalStoresShowList.push(transformedStore); // 推入統一列表
    }); // 處理全家商店

    this.nearbyFamilyMartStores.forEach(store => {
      const transformedStore = { ...store,
        label: '全家',
        distance: store.distance,
        showDistance: true
      };
      this.totalStoresShowList.push(transformedStore); // 推入統一列表
    });

    if (storeLatitude && storeLongitude) {
      this.totalStoresShowList.sort((a, b) => a.distance - b.distance);

      if (this.totalStoresShowList[0].distance > 1 || this.totalStoresShowList[0].remainingQty === 0) {
        alert('您所搜尋的店家目前無商品，請重新搜尋');
        this.totalStoresShowList = [];
        return;
      }

      this.totalStoresShowList = [{ ...this.totalStoresShowList[0],
        showDistance: false
      }];
    } else {
      // 根據距離排序
      this.totalStoresShowList.sort((a, b) => a.distance - b.distance);
    }
  }

  searchCombineAndTransformStores(storeLatitude, storeLongitude) {
    // 如果没有參數就用默認的定位值
    const finalLatitude = storeLatitude || this.latitude;
    const finalLongitude = storeLongitude || this.longitude;
    const locationData711 = {
      CurrentLocation: {
        Latitude: finalLatitude,
        Longitude: finalLongitude
      },
      SearchLocation: {
        Latitude: finalLatitude,
        Longitude: finalLongitude
      }
    };
    const locationFamilyMart = {
      Latitude: finalLatitude,
      Longitude: finalLongitude
    }; // 結合兩個 API 請求

    (0,rxjs__WEBPACK_IMPORTED_MODULE_15__.forkJoin)({
      sevenEleven: this.sevenElevenService.getNearByStoreList(locationData711),
      familyMart: this.familyMartService.getNearByStoreList(locationFamilyMart)
    }).subscribe(({
      sevenEleven,
      familyMart
    }) => {
      // 處理 7-11 資料
      if (sevenEleven && sevenEleven.element && sevenEleven.element.StoreStockItemList) {
        this.nearby711Stores = sevenEleven.element.StoreStockItemList.sort((a, b) => a.Distance - b.Distance);
      } // 處理全家資料


      if (familyMart && familyMart.code === 1) {
        this.nearbyFamilyMartStores = familyMart.data.sort((a, b) => a.distance - b.distance);
      } // 等兩者完成後合併資料


      if (storeLatitude && storeLongitude) {
        this.combineStoreList(storeLatitude, storeLongitude);
      } else {
        this.combineStoreList();
      }
    }, error => {
      console.error('Error fetching store data:', error);
    });
  }

  getFStoreQty(store) {
    var totalQty = 0;
    store.info.forEach(cat => {
      totalQty += cat.qty;
    });
    return totalQty;
  }

  getFUrl(cat) {
    return cat.iconURL;
  }

  getFCatName(cat) {
    return cat.name;
  }

  getFSubCategoryQty(store, cat) {
    return cat.qty;
  }

  fStoreName(storeName) {
    return storeName ? storeName.replace('全家', '') : '';
  }

}

NewSearchComponent.ɵfac = function NewSearchComponent_Factory(t) {
  return new (t || NewSearchComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_16__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](src_app_services_geolocation_service__WEBPACK_IMPORTED_MODULE_2__.GeolocationService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_seven_eleven_request_service__WEBPACK_IMPORTED_MODULE_3__.SevenElevenRequestService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_family_mart_request_service__WEBPACK_IMPORTED_MODULE_4__.FamilyMartRequestService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_loading_service__WEBPACK_IMPORTED_MODULE_5__.LoadingService));
};

NewSearchComponent.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineComponent"]({
  type: NewSearchComponent,
  selectors: [["app-new-search"]],
  decls: 26,
  vars: 10,
  consts: [[1, "container", "mx-auto", "my-8", "p-6", "bg-white", "shadow-lg", "rounded-lg", "max-w-4xl"], [1, "flex", "flex-col", "items-center"], [1, "flex", "items-center", "justify-center", "mb-6", "h-24"], ["src", "assets/S__222224406.jpg", "alt", "Friendly Superhero", 1, "w-24", "h-24", "sm:w-16", "sm:h-16", "md:w-24", "md:h-24", "rounded-full"], [1, "text-xl", "sm:text-xl", "font-bold", "ml-4", "py-2", "px-4", "border-2", "border-gray-300", "rounded-full", "bg-white", "inline-block"], [4, "ngIf"], ["mode", "indeterminate", "diameter", "20", 4, "ngIf"], [1, "text-xs", "sm:text-sm", "text-red-600", "mb-4", "text-center"], [1, "w-full", 3, "ngSubmit"], [1, "flex", "flex-wrap", "justify-center", "gap-4", "w-full", "items-center"], [1, "w-full", "sm:w-3/4", "lg:w-1/2"], ["matSuffix", "", 1, "text-gray-500"], ["matInput", "", "placeholder", "\u8F38\u5165\u5E97\u540D\u6216\u5730\u5740\u641C\u5C0B", "name", "searchTerm", 1, "p-3", "border-2", "border-gray-300", "rounded-md", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", 3, "matAutocomplete", "ngModel", "ngModelChange", "input"], [3, "optionSelected"], ["auto", "matAutocomplete"], ["class", "p-2 hover:bg-blue-100 focus:bg-blue-200", 3, "value", 4, "ngFor", "ngForOf"], ["type", "button", "mat-raised-button", "", "color", "warn", 1, "ml-4", "px-6", "py-3", "bg-red-500", "text-white", "rounded-md", "hover:bg-red-600", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "flex", "items-center", "gap-2", "text-xs", "sm:text-sm", "md:text-base", 3, "click"], [1, "text-sm"], ["mode", "indeterminate", "diameter", "20"], [1, "p-2", "hover:bg-blue-100", "focus:bg-blue-200", 3, "value"], ["class", "flex items-center gap-2", 4, "ngIf"], [1, "flex", "items-center", "gap-2"], ["alt", "7-Eleven Icon", 1, "w-4", "h-4", 3, "src"], [1, "text-xs", "sm:text-sm", "text-gray-500"], ["alt", "FamilyMart Icon", 1, "w-4", "h-4", 3, "src"], [4, "ngFor", "ngForOf"], ["class", "store p-4 border border-gray-300 rounded-lg shadow-md mb-6", 4, "ngIf"], [1, "store", "p-4", "border", "border-gray-300", "rounded-lg", "shadow-md", "mb-6"], [1, "store-icon", "flex", "items-center", "mb-3"], ["alt", "Store Icon", 1, "w-6", "h-6", "mr-2", 3, "src"], [1, "text-lg", "sm:text-xl", "font-semibold"], [1, "store-icon", "flex", "flex-col", "text-lg", "sm:text-xl"], [1, "lg:text-lg", "sm:text-xl", "text-gray-600"], ["target", "_blank", 1, "ml-2", 3, "href"], ["src", "assets/GoogleMap_icon.png", "alt", "Google Maps", 1, "w-6", "h-6", "inline-block"], [1, "food-categories", "mt-4"], [1, "grid", "grid-cols-2", "sm:grid-cols-3", "md:grid-cols-4", "lg:grid-cols-4", "gap-0"], ["class", "sub-category-details mt-4", 4, "ngIf"], [3, "class", "pointer-events-none", "click", 4, "ngIf"], [3, "click"], [1, "w-12", "h-12", "sm:w-14", "sm:h-14", "md:w-16", "md:h-16", "lg:w-20", "lg:h-20", "mx-auto", "mb-2", "object-cover", 3, "src", "alt", "ngStyle"], [1, "block", "text-sm", "sm:text-base", "font-semibold"], [1, "inline-block", "text-xs", "bg-orange-200", "text-orange-900", "sm:text-sm", "font-semibold", "px-4", "py-2", "rounded-full"], [1, "sub-category-details", "mt-4"], [3, "store", "category", "foodDetails"], [3, "class", "pointer-events-none", "click", 4, "ngFor", "ngForOf"], ["class", "sub-category-details mt-4 border-gray-700", 4, "ngIf"], [1, "sub-category-details", "mt-4", "border-gray-700"], [1, "border-gray-700", 3, "store", "category", "foodDetails"]],
  template: function NewSearchComponent_Template(rf, ctx) {
    if (rf & 1) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 0);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](1, 1);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 2);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](3, "img", 3);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "h5", 4);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](5, NewSearchComponent_div_5_Template, 2, 0, "div", 5);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](6, "async");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](7, NewSearchComponent_mat_progress_spinner_7_Template, 1, 0, "mat-progress-spinner", 6);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](8, "async");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](9, "div", 7)(10, "p");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](11, "* \u8CC7\u8A0A\u50C5\u4F9B\u53C3\u8003\uFF0C\u8ACB\u4EE5\u5E97\u5167\u5546\u54C1\u70BA\u6E96");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "form", 8);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("ngSubmit", function NewSearchComponent_Template_form_ngSubmit_12_listener() {
        return ctx.onSubmit();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](13, "div", 9)(14, "mat-form-field", 10)(15, "mat-icon", 11);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](16, "search");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](17, "input", 12);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("ngModelChange", function NewSearchComponent_Template_input_ngModelChange_17_listener($event) {
        return ctx.searchTerm = $event;
      })("input", function NewSearchComponent_Template_input_input_17_listener($event) {
        return ctx.onInput($event);
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](18, "mat-autocomplete", 13, 14);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("optionSelected", function NewSearchComponent_Template_mat_autocomplete_optionSelected_18_listener($event) {
        return ctx.onOptionSelect($event);
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](20, NewSearchComponent_mat_option_20_Template, 3, 3, "mat-option", 15);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](21, "button", 16);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function NewSearchComponent_Template_button_click_21_listener() {
        return ctx.onUseCurrentLocation();
      });
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](22, "mat-icon", 17);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](23, "location_on");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](24, " \u4F7F\u7528\u76EE\u524D\u4F4D\u7F6E ");
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](25, NewSearchComponent_div_25_Template, 2, 1, "div", 5);
    }

    if (rf & 2) {
      const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](19);

      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](6, 6, ctx.loadingService.loading$) === false);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](8, 8, ctx.loadingService.loading$));
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](10);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("matAutocomplete", _r2)("ngModel", ctx.searchTerm);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", ctx.unifiedDropDownList);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.totalStoresShowList.length > 0);
    }
  },
  dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_17__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_17__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_17__.NgStyle, _angular_forms__WEBPACK_IMPORTED_MODULE_9__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_9__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_9__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_9__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_9__.NgModel, _angular_forms__WEBPACK_IMPORTED_MODULE_9__.NgForm, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_18__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_18__.MatSuffix, _angular_material_core__WEBPACK_IMPORTED_MODULE_19__.MatOption, _angular_material_input__WEBPACK_IMPORTED_MODULE_20__.MatInput, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_21__.MatProgressSpinner, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_22__.MatAutocomplete, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_22__.MatAutocompleteTrigger, _angular_material_button__WEBPACK_IMPORTED_MODULE_23__.MatButton, _angular_material_icon__WEBPACK_IMPORTED_MODULE_24__.MatIcon, _display_display_component__WEBPACK_IMPORTED_MODULE_6__.DisplayComponent, _angular_common__WEBPACK_IMPORTED_MODULE_17__.AsyncPipe, _angular_common__WEBPACK_IMPORTED_MODULE_17__.SlicePipe, _pipes_round_pipe__WEBPACK_IMPORTED_MODULE_7__.RoundPipe],
  styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJuZXctc2VhcmNoLmNvbXBvbmVudC5zY3NzIn0= */"]
});

/***/ }),

/***/ 4107:
/*!********************************************************************************!*\
  !*** ./src/app/search-food/new-search/services/family-mart-request.service.ts ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FamilyMartRequestService": () => (/* binding */ FamilyMartRequestService)
/* harmony export */ });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ 2340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_request_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/request.service */ 9854);



class FamilyMartRequestService {
    constructor(requestService) {
        this.requestService = requestService;
        this.baseUrl = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.familyMartUrl.base;
    }
    getStores() {
        const url = 'assets/family_mart_stores.json';
        return this.requestService.get(url);
    }
    getNearByStoreList(location) {
        const url = this.baseUrl + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.familyMartUrl.endpoint.mapProductInfo;
        const body = {
            "ProjectCode": "202106302",
            "OldPKeys": [],
            "PostInfo": "",
            "Latitude": location.Latitude,
            "Longitude": location.Longitude
        };
        return this.requestService.post(url, null, body);
    }
    getFoodDetails() {
        const url = 'assets/family_mart_products.json';
        return this.requestService.get(url);
    }
}
FamilyMartRequestService.ɵfac = function FamilyMartRequestService_Factory(t) { return new (t || FamilyMartRequestService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](src_app_services_request_service__WEBPACK_IMPORTED_MODULE_1__.RequestService)); };
FamilyMartRequestService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: FamilyMartRequestService, factory: FamilyMartRequestService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 6325:
/*!*********************************************************************************!*\
  !*** ./src/app/search-food/new-search/services/seven-eleven-request.service.ts ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SevenElevenRequestService": () => (/* binding */ SevenElevenRequestService)
/* harmony export */ });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ 2340);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var src_app_services_request_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/request.service */ 9854);



class SevenElevenRequestService {
    constructor(requestService) {
        this.requestService = requestService;
        this.baseUrl = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.base;
    }
    getAccessToken() {
        const url = this.baseUrl + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.endpoint.accessToken;
        const params = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.params;
        return this.requestService.post(url, params);
    }
    getStoreByAddress(keyword) {
        const url = this.baseUrl + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.endpoint.getStoreByAddress;
        const params = {
            'token': sessionStorage.getItem('711Token'),
            'keyword': keyword
        };
        return this.requestService.post(url, params);
    }
    getNearByStoreList(location) {
        const url = this.baseUrl + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.endpoint.getNearbyStoreList;
        const params = {
            'token': sessionStorage.getItem('711Token')
        };
        return this.requestService.post(url, params, location);
    }
    getFoodCategory() {
        const url = this.baseUrl + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.endpoint.getList;
        const params = {
            'token': sessionStorage.getItem('711Token')
        };
        return this.requestService.post(url, params);
    }
    getItemsByStoreNo(storeNo) {
        const url = this.baseUrl + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.sevenElevenUrl.endpoint.getStoreDetail;
        const params = {
            'token': sessionStorage.getItem('711Token'),
        };
        const body = {
            storeNo: storeNo,
            CurrentLocation: {
                Latitude: 25.0375197,
                Longitude: 121.5636704
            }
        };
        return this.requestService.post(url, params, body);
    }
    getFoodDetails() {
        const url = 'assets/seven_eleven_products.json';
        return this.requestService.get(url);
    }
}
SevenElevenRequestService.ɵfac = function SevenElevenRequestService_Factory(t) { return new (t || SevenElevenRequestService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](src_app_services_request_service__WEBPACK_IMPORTED_MODULE_1__.RequestService)); };
SevenElevenRequestService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: SevenElevenRequestService, factory: SevenElevenRequestService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 8897:
/*!***************************************************!*\
  !*** ./src/app/search-food/search-food.module.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SearchFoodModule": () => (/* binding */ SearchFoodModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/select */ 7371);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/autocomplete */ 8550);
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/button */ 4522);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/card */ 2156);
/* harmony import */ var _pipes_round_pipe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../pipes/round.pipe */ 8007);
/* harmony import */ var _pipes_empty_info_pipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../pipes/empty-info.pipe */ 3301);
/* harmony import */ var _new_search_display_display_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./new-search/display/display.component */ 6429);
/* harmony import */ var _new_search_new_search_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./new-search/new-search.component */ 4052);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);

 // 用於雙向綁定 [(ngModel)]

// 导入 Angular Material 模块
 // 用于 form-field
 // 用于下拉選單
 // 用于 mat-option
 // 用于 mat-label 和其他输入框功能

 // 用於 mat-autocomplete
 // 用於 mat-button







class SearchFoodModule {
}
SearchFoodModule.ɵfac = function SearchFoodModule_Factory(t) { return new (t || SearchFoodModule)(); };
SearchFoodModule.ɵmod = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({ type: SearchFoodModule });
SearchFoodModule.ɵinj = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({ imports: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule,
        _angular_forms__WEBPACK_IMPORTED_MODULE_6__.FormsModule,
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__.MatFormFieldModule,
        _angular_material_select__WEBPACK_IMPORTED_MODULE_8__.MatSelectModule,
        _angular_material_core__WEBPACK_IMPORTED_MODULE_9__.MatOptionModule,
        _angular_material_input__WEBPACK_IMPORTED_MODULE_10__.MatInputModule,
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_11__.MatProgressSpinnerModule,
        _angular_forms__WEBPACK_IMPORTED_MODULE_6__.ReactiveFormsModule,
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_12__.MatAutocompleteModule,
        _angular_material_button__WEBPACK_IMPORTED_MODULE_13__.MatButtonModule,
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__.MatIconModule,
        _angular_material_card__WEBPACK_IMPORTED_MODULE_15__.MatCardModule] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](SearchFoodModule, { declarations: [_new_search_display_display_component__WEBPACK_IMPORTED_MODULE_2__.DisplayComponent,
        _new_search_new_search_component__WEBPACK_IMPORTED_MODULE_3__.NewSearchComponent,
        _pipes_round_pipe__WEBPACK_IMPORTED_MODULE_0__.RoundPipe,
        _pipes_empty_info_pipe__WEBPACK_IMPORTED_MODULE_1__.EmptyInfoPipe], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule,
        _angular_forms__WEBPACK_IMPORTED_MODULE_6__.FormsModule,
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__.MatFormFieldModule,
        _angular_material_select__WEBPACK_IMPORTED_MODULE_8__.MatSelectModule,
        _angular_material_core__WEBPACK_IMPORTED_MODULE_9__.MatOptionModule,
        _angular_material_input__WEBPACK_IMPORTED_MODULE_10__.MatInputModule,
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_11__.MatProgressSpinnerModule,
        _angular_forms__WEBPACK_IMPORTED_MODULE_6__.ReactiveFormsModule,
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_12__.MatAutocompleteModule,
        _angular_material_button__WEBPACK_IMPORTED_MODULE_13__.MatButtonModule,
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__.MatIconModule,
        _angular_material_card__WEBPACK_IMPORTED_MODULE_15__.MatCardModule] }); })();


/***/ }),

/***/ 4375:
/*!*************************************************!*\
  !*** ./src/app/services/geolocation.service.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GeolocationService": () => (/* binding */ GeolocationService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 2560);

class GeolocationService {
    constructor() { }
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => resolve(position), (error) => reject(error));
            }
            else {
                reject(new Error('瀏覽器不支援地理位置功能'));
            }
        });
    }
}
GeolocationService.ɵfac = function GeolocationService_Factory(t) { return new (t || GeolocationService)(); };
GeolocationService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: GeolocationService, factory: GeolocationService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 4471:
/*!*********************************************!*\
  !*** ./src/app/services/loading.service.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LoadingService": () => (/* binding */ LoadingService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 6317);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);


class LoadingService {
    constructor() {
        this.loadingSubject = new rxjs__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(false);
        this.loading$ = this.loadingSubject.asObservable();
    }
    show() {
        this.loadingSubject.next(true);
    }
    hide() {
        this.loadingSubject.next(false);
    }
}
LoadingService.ɵfac = function LoadingService_Factory(t) { return new (t || LoadingService)(); };
LoadingService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: LoadingService, factory: LoadingService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 9854:
/*!*********************************************!*\
  !*** ./src/app/services/request.service.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RequestService": () => (/* binding */ RequestService)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ 8987);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);



class RequestService {
    constructor(http) {
        this.http = http;
    }
    get(url, params = {}) {
        let httpParams = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpParams();
        // 處理 query parameters
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                httpParams = httpParams.set(key, params[key]);
            }
        }
        // 發送 GET 請求
        return this.http.get(url, { params: httpParams });
    }
    post(url, params, body) {
        let httpParams = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpParams();
        // 直接將 params 加入 httpParams，不做物件檢查
        if (params) {
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    httpParams = httpParams.set(key, params[key]);
                }
            }
        }
        // 發送 POST 請求
        return this.http.post(url, body || {}, { params: httpParams });
    }
}
RequestService.ɵfac = function RequestService_Factory(t) { return new (t || RequestService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpClient)); };
RequestService.ɵprov = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: RequestService, factory: RequestService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ 2340:
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "environment": () => (/* binding */ environment)
/* harmony export */ });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false,
    familyMartUrl: {
        icon: 'https://www.family.com.tw/NewEnterprise/CSR/images/favicon.ico',
        base: 'https://stamp.family.com.tw/api/maps',
        storeQuery: 'https://family.map.com.tw/famiport/api/dropdownlist/Select_StoreName',
        endpoint: {
            mapClassificationInfo: '/MapClassificationInfo',
            mapProductInfo: '/MapProductInfo'
        }
    },
    sevenElevenUrl: {
        icon: 'https://www.7-11.com.tw/favicon.ico',
        base: 'https://lovefood.openpoint.com.tw/LoveFood/api/',
        endpoint: {
            accessToken: 'Auth/FrontendAuth/AccessToken',
            getList: 'Master/FrontendItemCategory/GetList',
            getStoreByAddress: 'Master/FrontendStore/GetStoreByAddress',
            getNearbyStoreList: 'Search/FrontendStoreItemStock/GetNearbyStoreList',
            getStoreDetail: 'Search/FrontendStoreItemStock/GetStoreDetail'
        },
        params: {
            mid_v: 'W0_DiF4DlgU5OeQoRswrRcaaNHMWOL7K3ra3389ocJQv-rdOWS6Zu4AtGa7-7pjiccl0C5gm0u5UNONXuVUXcJCidRjIv9dsUd8PocNr5moiuJJ8hZla5iV0H3-8dZfASc7GgEm74679LYK2hBB-Sam6D0LAnYK9Lb0DZjaSctnHS5yYugtrYNdWoWk'
        }
    }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ 4431:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ 4497);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app/app.module */ 6747);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ 2340);




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.production) {
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.enableProdMode)();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__.platformBrowser().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_0__.AppModule)
    .catch(err => console.error(err));


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(4431)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.js.map