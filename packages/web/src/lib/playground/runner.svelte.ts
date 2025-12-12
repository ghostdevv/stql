import { ClearTerminal, type TerminalStreamValue } from './Terminal.svelte';
import { browser } from '$app/environment';
import runnerHTML from './runner.html?raw';
import { printAnsi } from './print-ansi';

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

	private terminalWritable: WritableStream<TerminalStreamValue>;
	public terminalStream: ReadableStream<TerminalStreamValue>;

	constructor() {
		const { readable, writable } = new TransformStream<
			TerminalStreamValue,
			TerminalStreamValue
		>();

		this.terminalWritable = writable;
		this.terminalStream = readable;
	}

	private async writeRaw(data: TerminalStreamValue) {
		const writer = this.terminalWritable.getWriter();
		await writer.ready;
		await writer.write(data);
		writer.releaseLock();
	}

	private async writeMessage(message: Message) {
		const content =
			message.type === 'console'
				? message.args.map(printAnsi).join(' ')
				: `\x1B[41m${message.message}\x1B[0m`;

		await this.writeRaw(`${content}\n\n`);
	}

	run(code: string) {
		if (!browser) return;

		this.writeRaw(ClearTerminal);

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

		const runnerDocument = runnerHTML
			.replaceAll('__RUNNER_ID__', JSON.stringify(runId))
			.replaceAll('__RUNNER_ORIGIN__', JSON.stringify(location.origin))
			.replaceAll('__RUNNER_CODE__', code);

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
