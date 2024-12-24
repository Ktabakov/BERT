/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/WalletContext.tsx":
/*!**************************************!*\
  !*** ./components/WalletContext.tsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WalletProvider: () => (/* binding */ WalletProvider),\n/* harmony export */   useWallet: () => (/* binding */ useWallet)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst WalletContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst WalletProvider = ({ children })=>{\n    const [isConnected, setIsConnected] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [walletAPI, setWalletAPI] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(undefined);\n    const [walletAddress, setWalletAddress] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [connectedWallet, setConnectedWallet] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const reconnectWallet = async ()=>{\n            const savedWallet = localStorage.getItem(\"connectedWallet\");\n            if (savedWallet && \"undefined\" !== \"undefined\" && 0) {}\n        };\n        reconnectWallet();\n    }, []);\n    const connectWallet = async (api, walletName)=>{\n        localStorage.setItem(\"connectedWallet\", walletName);\n        setWalletAPI(api);\n        const address = await api.getChangeAddress();\n        setWalletAddress(address);\n        setConnectedWallet(walletName);\n        setIsConnected(true);\n    };\n    const disconnectWallet = ()=>{\n        localStorage.removeItem(\"connectedWallet\");\n        setWalletAPI(undefined);\n        setWalletAddress(null);\n        setConnectedWallet(null);\n        setIsConnected(false);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(WalletContext.Provider, {\n        value: {\n            isConnected,\n            walletAPI,\n            walletAddress,\n            connectedWallet,\n            connectWallet,\n            disconnectWallet\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"D:\\\\Ultimate-Cardano-Smart-Contracts\\\\FlappyBirdGame\\\\helios\\\\GameReward\\\\components\\\\WalletContext.tsx\",\n        lineNumber: 60,\n        columnNumber: 5\n    }, undefined);\n};\nconst useWallet = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(WalletContext);\n    if (!context) {\n        throw new Error(\"useWallet must be used within a WalletProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL1dhbGxldENvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBOEU7QUFXOUUsTUFBTUssOEJBQWdCSixvREFBYUEsQ0FBaUNLO0FBRTdELE1BQU1DLGlCQUEwRCxDQUFDLEVBQUVDLFFBQVEsRUFBRTtJQUNsRixNQUFNLENBQUNDLGFBQWFDLGVBQWUsR0FBR1AsK0NBQVFBLENBQUM7SUFDL0MsTUFBTSxDQUFDUSxXQUFXQyxhQUFhLEdBQUdULCtDQUFRQSxDQUFNRztJQUNoRCxNQUFNLENBQUNPLGVBQWVDLGlCQUFpQixHQUFHWCwrQ0FBUUEsQ0FBZ0I7SUFDbEUsTUFBTSxDQUFDWSxpQkFBaUJDLG1CQUFtQixHQUFHYiwrQ0FBUUEsQ0FBZ0I7SUFFdEVDLGdEQUFTQSxDQUFDO1FBQ1IsTUFBTWEsa0JBQWtCO1lBQ3RCLE1BQU1DLGNBQWNDLGFBQWFDLE9BQU8sQ0FBQztZQUV6QyxJQUFJRixlQUFlLGdCQUFrQixlQUFlRyxDQUE2QixFQUFFLEVBWWxGO1FBQ0g7UUFFQUo7SUFDRixHQUFHLEVBQUU7SUFFTCxNQUFNYyxnQkFBZ0IsT0FBT0MsS0FBVUM7UUFDckNkLGFBQWFlLE9BQU8sQ0FBQyxtQkFBbUJEO1FBQ3hDckIsYUFBYW9CO1FBQ2IsTUFBTVAsVUFBVSxNQUFNTyxJQUFJTixnQkFBZ0I7UUFDMUNaLGlCQUFpQlc7UUFDakJULG1CQUFtQmlCO1FBQ25CdkIsZUFBZTtJQUNqQjtJQUVBLE1BQU15QixtQkFBbUI7UUFDdkJoQixhQUFhVyxVQUFVLENBQUM7UUFDeEJsQixhQUFhTjtRQUNiUSxpQkFBaUI7UUFDakJFLG1CQUFtQjtRQUNuQk4sZUFBZTtJQUNqQjtJQUVBLHFCQUNFLDhEQUFDTCxjQUFjK0IsUUFBUTtRQUNyQkMsT0FBTztZQUNMNUI7WUFDQUU7WUFDQUU7WUFDQUU7WUFDQWdCO1lBQ0FJO1FBQ0Y7a0JBRUMzQjs7Ozs7O0FBR1AsRUFBRTtBQUVLLE1BQU04QixZQUFZO0lBQ3ZCLE1BQU1DLFVBQVVyQyxpREFBVUEsQ0FBQ0c7SUFDM0IsSUFBSSxDQUFDa0MsU0FBUztRQUNaLE1BQU0sSUFBSUMsTUFBTTtJQUNsQjtJQUNBLE9BQU9EO0FBQ1QsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL3Zlc3RpbmcvLi9jb21wb25lbnRzL1dhbGxldENvbnRleHQudHN4PzFjYjUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcclxuXHJcbmludGVyZmFjZSBXYWxsZXRDb250ZXh0UHJvcHMge1xyXG4gIGlzQ29ubmVjdGVkOiBib29sZWFuO1xyXG4gIHdhbGxldEFQSTogYW55O1xyXG4gIHdhbGxldEFkZHJlc3M6IHN0cmluZyB8IG51bGw7XHJcbiAgY29ubmVjdGVkV2FsbGV0OiBzdHJpbmcgfCBudWxsO1xyXG4gIGNvbm5lY3RXYWxsZXQ6IChhcGk6IGFueSwgd2FsbGV0TmFtZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG4gIGRpc2Nvbm5lY3RXYWxsZXQ6ICgpID0+IHZvaWQ7XHJcbn1cclxuXHJcbmNvbnN0IFdhbGxldENvbnRleHQgPSBjcmVhdGVDb250ZXh0PFdhbGxldENvbnRleHRQcm9wcyB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcclxuXHJcbmV4cG9ydCBjb25zdCBXYWxsZXRQcm92aWRlcjogUmVhY3QuRkM8eyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IFtpc0Nvbm5lY3RlZCwgc2V0SXNDb25uZWN0ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFt3YWxsZXRBUEksIHNldFdhbGxldEFQSV0gPSB1c2VTdGF0ZTxhbnk+KHVuZGVmaW5lZCk7XHJcbiAgY29uc3QgW3dhbGxldEFkZHJlc3MsIHNldFdhbGxldEFkZHJlc3NdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgW2Nvbm5lY3RlZFdhbGxldCwgc2V0Q29ubmVjdGVkV2FsbGV0XSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3QgcmVjb25uZWN0V2FsbGV0ID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBzYXZlZFdhbGxldCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY29ubmVjdGVkV2FsbGV0XCIpO1xyXG5cclxuICAgICAgaWYgKHNhdmVkV2FsbGV0ICYmIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmNhcmRhbm8/LltzYXZlZFdhbGxldF0pIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3Qgd0FQSSA9IGF3YWl0IHdpbmRvdy5jYXJkYW5vW3NhdmVkV2FsbGV0XS5lbmFibGUoKTtcclxuICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBhd2FpdCB3QVBJLmdldENoYW5nZUFkZHJlc3MoKTtcclxuICAgICAgICAgIHNldFdhbGxldEFQSSh3QVBJKTtcclxuICAgICAgICAgIHNldFdhbGxldEFkZHJlc3MoYWRkcmVzcyk7XHJcbiAgICAgICAgICBzZXRDb25uZWN0ZWRXYWxsZXQoc2F2ZWRXYWxsZXQpO1xyXG4gICAgICAgICAgc2V0SXNDb25uZWN0ZWQodHJ1ZSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHJlY29ubmVjdCB3YWxsZXQ6XCIsIGVycik7XHJcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImNvbm5lY3RlZFdhbGxldFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmVjb25uZWN0V2FsbGV0KCk7XHJcbiAgfSwgW10pO1xyXG5cclxuICBjb25zdCBjb25uZWN0V2FsbGV0ID0gYXN5bmMgKGFwaTogYW55LCB3YWxsZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY29ubmVjdGVkV2FsbGV0XCIsIHdhbGxldE5hbWUpO1xyXG4gICAgc2V0V2FsbGV0QVBJKGFwaSk7XHJcbiAgICBjb25zdCBhZGRyZXNzID0gYXdhaXQgYXBpLmdldENoYW5nZUFkZHJlc3MoKTtcclxuICAgIHNldFdhbGxldEFkZHJlc3MoYWRkcmVzcyk7XHJcbiAgICBzZXRDb25uZWN0ZWRXYWxsZXQod2FsbGV0TmFtZSk7XHJcbiAgICBzZXRJc0Nvbm5lY3RlZCh0cnVlKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBkaXNjb25uZWN0V2FsbGV0ID0gKCkgPT4ge1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJjb25uZWN0ZWRXYWxsZXRcIik7XHJcbiAgICBzZXRXYWxsZXRBUEkodW5kZWZpbmVkKTtcclxuICAgIHNldFdhbGxldEFkZHJlc3MobnVsbCk7XHJcbiAgICBzZXRDb25uZWN0ZWRXYWxsZXQobnVsbCk7XHJcbiAgICBzZXRJc0Nvbm5lY3RlZChmYWxzZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxXYWxsZXRDb250ZXh0LlByb3ZpZGVyXHJcbiAgICAgIHZhbHVlPXt7XHJcbiAgICAgICAgaXNDb25uZWN0ZWQsXHJcbiAgICAgICAgd2FsbGV0QVBJLFxyXG4gICAgICAgIHdhbGxldEFkZHJlc3MsXHJcbiAgICAgICAgY29ubmVjdGVkV2FsbGV0LFxyXG4gICAgICAgIGNvbm5lY3RXYWxsZXQsXHJcbiAgICAgICAgZGlzY29ubmVjdFdhbGxldCxcclxuICAgICAgfX1cclxuICAgID5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9XYWxsZXRDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXNlV2FsbGV0ID0gKCk6IFdhbGxldENvbnRleHRQcm9wcyA9PiB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoV2FsbGV0Q29udGV4dCk7XHJcbiAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1c2VXYWxsZXQgbXVzdCBiZSB1c2VkIHdpdGhpbiBhIFdhbGxldFByb3ZpZGVyXCIpO1xyXG4gIH1cclxuICByZXR1cm4gY29udGV4dDtcclxufTtcclxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsIldhbGxldENvbnRleHQiLCJ1bmRlZmluZWQiLCJXYWxsZXRQcm92aWRlciIsImNoaWxkcmVuIiwiaXNDb25uZWN0ZWQiLCJzZXRJc0Nvbm5lY3RlZCIsIndhbGxldEFQSSIsInNldFdhbGxldEFQSSIsIndhbGxldEFkZHJlc3MiLCJzZXRXYWxsZXRBZGRyZXNzIiwiY29ubmVjdGVkV2FsbGV0Iiwic2V0Q29ubmVjdGVkV2FsbGV0IiwicmVjb25uZWN0V2FsbGV0Iiwic2F2ZWRXYWxsZXQiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwid2luZG93IiwiY2FyZGFubyIsIndBUEkiLCJlbmFibGUiLCJhZGRyZXNzIiwiZ2V0Q2hhbmdlQWRkcmVzcyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInJlbW92ZUl0ZW0iLCJjb25uZWN0V2FsbGV0IiwiYXBpIiwid2FsbGV0TmFtZSIsInNldEl0ZW0iLCJkaXNjb25uZWN0V2FsbGV0IiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZVdhbGxldCIsImNvbnRleHQiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/WalletContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_WalletContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/WalletContext */ \"./components/WalletContext.tsx\");\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_WalletContext__WEBPACK_IMPORTED_MODULE_2__.WalletProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"D:\\\\Ultimate-Cardano-Smart-Contracts\\\\FlappyBirdGame\\\\helios\\\\GameReward\\\\pages\\\\_app.tsx\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"D:\\\\Ultimate-Cardano-Smart-Contracts\\\\FlappyBirdGame\\\\helios\\\\GameReward\\\\pages\\\\_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQThCO0FBRThCO0FBRTVELFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDL0MscUJBQ0UsOERBQUNILHFFQUFjQTtrQkFDYiw0RUFBQ0U7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QjtBQUVBLGlFQUFlRixLQUFLQSxFQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdmVzdGluZy8uL3BhZ2VzL19hcHAudHN4PzJmYmUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnXHJcbmltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCdcclxuaW1wb3J0IHsgV2FsbGV0UHJvdmlkZXIgfSBmcm9tICcuLi9jb21wb25lbnRzL1dhbGxldENvbnRleHQnXHJcblxyXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxXYWxsZXRQcm92aWRlcj5cclxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgPC9XYWxsZXRQcm92aWRlcj5cclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwXHJcbiJdLCJuYW1lcyI6WyJXYWxsZXRQcm92aWRlciIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();