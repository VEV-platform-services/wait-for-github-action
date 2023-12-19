import * as console from "console";

const loggingEnabled = !!process.env.DEBUG;

export const log = (message: string, context?: unknown) => {
    if (!loggingEnabled) {
        return
    }
    console.log(message)
    if (context)
        console.log(context)

}
