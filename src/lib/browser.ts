import {execa} from 'execa'

export async function openUrlInBrowser(url: string): Promise<void> {
  const command = getOpenCommand(url)

  try {
    await execa(command.binary, command.args)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to open browser for URL: ${url}\n${message}`)
  }
}

type OpenCommand = {
  args: string[]
  binary: string
}

function getOpenCommand(url: string): OpenCommand {
  if (process.platform === 'darwin') {
    return {
      binary: 'open',
      args: [url],
    }
  }

  if (process.platform === 'linux') {
    return {
      binary: 'xdg-open',
      args: [url],
    }
  }

  if (process.platform === 'win32') {
    return {
      binary: 'cmd',
      args: ['/c', 'start', '', url],
    }
  }

  throw new Error(`Unsupported platform "${process.platform}". URL: ${url}`)
}
