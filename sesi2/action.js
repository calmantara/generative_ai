import { exchange } from "./exchange.js";

export async function act(text) {
    const MARKER = "Action:";
    const pos = text.indexOf(MARKER);
    if (pos < 0) return null;

    const subtext = `${text.substr(pos)} + \n`;
    const matches = /Action:\s*(.*?)\n/.exec(subtext);
    if (!matches) return null;

    const action = matches[1];
    if (!action) return null;

    const SEPARATOR = ":";
    const sep = action.indexOf(SEPARATOR);
    if (sep < 0) return null;

    const fnName = action.substring(0, sep);
    const fnArgs = action.substring(sep + 1).trim().split(" ");

    if (fnName === "lookup") return null;

    if (fnName === "exchange") {
        const result = await exchange(fnArgs[0], fnArgs[1]);
        console.log("ACT: exchange", { args: fnArgs, result });
        return { action, name: fnName, args: fnArgs, result };
    }

    console.log("Not recognized action:", { action, name: fnName, args: fnArgs });
}
