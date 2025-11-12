import { browser } from '$app/environment';
import { printAnsi } from './print-ansi';

const createRunnerDocument = (id: string, userCode: string) => `
    <!doctype html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="modulepreload" href="https://esm.sh/stql@0.3.1" />
            <script type="importmap">
                {
                    "imports": {
                        "stql": "https://esm.sh/stql@0.3.1"
                    }
                }
            </script>
        </head>
        <body>
            <p>running</p>

            <script type="module">
                const METHODS = ['log', 'warn', 'error', 'info'];

                function send(type, data) {
                    parent.postMessage({
                        id: ${JSON.stringify(id)},
                        type,
                        ts: Date.now(),
                        ...data
                    }, ${JSON.stringify(window.origin)});
                }

                for (const method of METHODS) {
                    const original = console[method];
                    console[method] = function(...args) {
                        try {
                            send('console', { method, args });
                        } catch (error) {
                            console.error('failed to send console message:', error);
                            send('error', { message: error.message });
                        }

                        return original.call(this, ...args);
                    }
                }

                window.addEventListener('error', (event) => {
                    send('error', { message: event.message });
                });
            </script>

            <script type="module">
                ${userCode}
            </script>
        </body>
    </html>
`;

interface ConsoleMessage {
	id: string;
	type: 'console';
	method: 'log' | 'warn' | 'error' | 'info';
	ts: number;
	args: unknown[];
}

interface ErrorMessage {
	id: string;
	type: 'error';
	ts: number;
	message: string;
}

type Message = ConsoleMessage | ErrorMessage;

function isMessage(runId: string, data: unknown): data is Message {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		data.id === runId &&
		'type' in data &&
		typeof data.type === 'string' &&
		['console', 'error'].includes(data.type)
	);
}

export class Runner {
	private cleanupLastRun: (() => void) | null = null;

	private terminalWritable: WritableStream<string>;
	public terminalStream: ReadableStream<string>;

	constructor() {
		const { readable, writable } = new TransformStream<string, string>();
		this.terminalWritable = writable;
		this.terminalStream = readable;
	}

	private async writeMessage(message: Message) {
		const writer = this.terminalWritable.getWriter();
		await writer.ready;

		const content =
			message.type === 'console'
				? message.args.map(printAnsi).join(' ')
				: `\x1B[41m${message.message}\x1B[0m`;

		await writer.write(`${content}\n\n`);
		writer.releaseLock();
	}

	run(code: string) {
		if (!browser) return;

		this.cleanupLastRun?.();
		const frame = document.createElement('iframe');
		frame.sandbox = 'allow-scripts';
		frame.style.display = 'none';
		document.body.appendChild(frame);

		const runId = crypto.randomUUID();

		const handleMessage = (event: MessageEvent) => {
			if (!event.isTrusted || !isMessage(runId, event.data)) return;
			this.writeMessage(event.data);
		};

		window.addEventListener('message', handleMessage);

		const runnerDocument = createRunnerDocument(runId, code);
		const blob = new Blob([runnerDocument], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		frame.src = url;

		this.cleanupLastRun = () => {
			frame.src = '';
			URL.revokeObjectURL(url);
			document.body.removeChild(frame);
			window.removeEventListener('message', handleMessage);
		};
	}

	cleanup() {
		this.cleanupLastRun?.();
		this.terminalWritable.close();
		this.terminalStream.cancel();
	}
}
