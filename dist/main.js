/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/App.jsx":
/*!********************************!*\
  !*** ./src/components/App.jsx ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _TemperatureControl_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TemperatureControl.jsx */ \"./src/components/TemperatureControl.jsx\");\nfunction _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }\n\n\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {\n  let zones = [{\n    zone: '1',\n    temperature: 21.5,\n    targetTemperature: 25.,\n    targetTemperatureDelta: 0.2,\n    humidity: 56.\n  }, {\n    zone: '2',\n    temperature: 22.4,\n    targetTemperature: 23.4,\n    targetTemperatureDelta: 0.1,\n    humidity: 55.6\n  }, {\n    zone: '3',\n    temperature: 13.5,\n    targetTemperature: 0.,\n    targetTemperatureDelta: 0.,\n    humidity: 98.2\n  }];\n  return /*#__PURE__*/React.createElement(\"div\", null, zones.map((zone, index) => /*#__PURE__*/React.createElement(_TemperatureControl_jsx__WEBPACK_IMPORTED_MODULE_0__.default, _extends({\n    key: index\n  }, zone))));\n}\n\n//# sourceURL=webpack://firstreact/./src/components/App.jsx?");

/***/ }),

/***/ "./src/components/TemperatureControl.jsx":
/*!***********************************************!*\
  !*** ./src/components/TemperatureControl.jsx ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TemperatureControl.module.css */ \"./src/components/TemperatureControl.module.css\");\n\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__({\n  zone,\n  temperature = 0.,\n  targetTemperature = 0.,\n  targetTemperatureDelta = 0.1,\n  humidity = 0.\n}) {\n  return /*#__PURE__*/React.createElement(\"div\", {\n    className: controlbox\n  }, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.header\n  }, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.indicator\n  }), 'ZONE' + zone), /*#__PURE__*/React.createElement(\"div\", null, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.button,\n    onClick: () => {\n      console.log('pwrcontrol_button');\n    }\n  }, \"PWRCTRL\"), /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.button\n  }, \"PWR\"), /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.button\n  }, \"CONFIG\")), /*#__PURE__*/React.createElement(\"div\", null, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.button,\n    onClick: () => {\n      console.log('showpwr_button');\n    }\n  }, \"SHOWPWR\")), /*#__PURE__*/React.createElement(\"div\", null, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.parameter,\n    onClick: () => {\n      console.log('modalopen_button');\n    }\n  }, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.name\n  }, \"temperature\"), /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.value\n  }, temperature.toFixed(1) + '°(' + targetTemperature.toFixed(1) + '±' + targetTemperatureDelta.toFixed(1) + '°)')), /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.parameter\n  }, /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.name\n  }, \"humidity\"), /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.value\n  }, humidity.toFixed(1) + '%'))), /*#__PURE__*/React.createElement(\"div\", {\n    className: _TemperatureControl_module_css__WEBPACK_IMPORTED_MODULE_0__.default.sensorstatus\n  }));\n}\n\n//# sourceURL=webpack://firstreact/./src/components/TemperatureControl.jsx?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_App_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/App.jsx */ \"./src/components/App.jsx\");\n/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.css */ \"./src/index.css\");\n//import React from 'react';\n//import ReactDOM from 'react-dom';\n\n\nReactDOM.render( /*#__PURE__*/React.createElement(_components_App_jsx__WEBPACK_IMPORTED_MODULE_0__.default, null), document.getElementById('root'));\n\n//# sourceURL=webpack://firstreact/./src/index.js?");

/***/ }),

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://firstreact/./src/index.css?");

/***/ }),

/***/ "./src/components/TemperatureControl.module.css":
/*!******************************************************!*\
  !*** ./src/components/TemperatureControl.module.css ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n// extracted by mini-css-extract-plugin\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\"controlbox\":\"controlbox_dee125d\",\"header\":\"header_b192608\",\"button\":\"button_ad5f59c\",\"parameter\":\"parameter__888c3e\",\"name\":\"name__802376\",\"value\":\"value_cfa05a3\"});\n\n//# sourceURL=webpack://firstreact/./src/components/TemperatureControl.module.css?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;