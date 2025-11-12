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

                for (const method of METHODS) {
                    const original = console[method];
                    console[method] = function(...args) {
                        parent.postMessage({ id: ${JSON.stringify(id)}, type: 'console', ts: Date.now(), method, args }, ${JSON.stringify(window.origin)});
                        return original.call(this, ...args);
                    }
                }
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

type Message = ConsoleMessage;

function isMessage(runId: string, data: unknown): data is Message {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		data.id === runId &&
		'type' in data &&
		typeof data.type === 'string' &&
		['console'].includes(data.type)
	);
}

export class Runner {
	private cleanupLastRun: (() => void) | null = null;

	run(code: string) {
		// biome-ignore lint/style/useConst: wrong
		let messages = $state<ConsoleMessage[]>([]);

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

		window.addEventListener('message', (event) => {
			if (!event.isTrusted || !isMessage(runId, event.data)) return;
			messages.push(event.data);
		});

		const runnerDocument = createRunnerDocument(runId, code);
		const blob = new Blob([runnerDocument], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		frame.src = url;

		this.cleanupLastRun = () => {
			frame.src = '';
			URL.revokeObjectURL(url);
			document.body.removeChild(frame);
		};

		return {
			get messages() {
				return messages;
			},
		};
	}

	cleanup() {}
}
