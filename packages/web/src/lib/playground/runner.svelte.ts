import { browser } from '$app/environment';

const createRunnerDocument = (id: string, userCode: string) => `
    <!doctype html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
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

	run(code: string) {
		// biome-ignore lint/style/useConst: wrong
		let messages = $state<Message[]>([]);

		if (!browser) {
			return {
				get messages() {
					return messages;
				},
			};
		}

		this.cleanupLastRun?.();
		const frame = document.createElement('iframe');
		frame.sandbox = 'allow-scripts';
		frame.style.display = 'none';
		document.body.appendChild(frame);

		const runId = crypto.randomUUID();

		function handleMessage(event: MessageEvent) {
			if (!event.isTrusted || !isMessage(runId, event.data)) return;
			messages.push(event.data);
		}

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

		return {
			get messages() {
				return messages;
			},
		};
	}

	cleanup() {
		this.cleanupLastRun?.();
	}
}
