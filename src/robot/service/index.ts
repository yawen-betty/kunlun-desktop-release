import {AIRobotService} from "@/robot/service/AIRobotService.ts";
import {CDPRobotService} from "@/robot/service/CDPRobotService.ts";
import {MCPRobotService} from "@/robot/service/MCPRobotService.ts";
import {RobotManager} from "@/robot/service/RobotManager.ts";

export const aiService = AIRobotService.getInstance();
export const cdpService = CDPRobotService.getInstance();
export const mcpService = MCPRobotService.getInstance();
export const robotManager = RobotManager.getInstance();
