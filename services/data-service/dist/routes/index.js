"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/index.ts
const express_1 = require("express");
const results_1 = __importDefault(require("./results"));
const interfaceResults_1 = __importDefault(require("./interfaceResults"));
const mainRouter = (0, express_1.Router)();
mainRouter.use('/results', results_1.default);
mainRouter.use('/interface-results', interfaceResults_1.default);
exports.default = mainRouter;
