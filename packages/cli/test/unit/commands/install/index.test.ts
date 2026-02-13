import { beforeEach, describe, expect, it, vi } from 'vitest';
import install from '../../../../src/commands/install';
import * as addModule from '../../../../src/commands/integration/add';
import { client } from '../../../mocks/client';

const addFromFlagsSpy = vi
  .spyOn(addModule, 'addFromFlags')
  .mockResolvedValue(0);

beforeEach(() => {
  addFromFlagsSpy.mockClear();
});

describe('install', () => {
  describe('--help', () => {
    it('tracks telemetry', async () => {
      const command = 'install';

      client.setArgv(command, '--help');
      const exitCodePromise = install(client);
      await expect(exitCodePromise).resolves.toEqual(0);

      expect(client.telemetryEventStore).toHaveTelemetryEvents([
        {
          key: 'flag:help',
          value: command,
        },
      ]);
    });
  });

  describe('[integration]', () => {
    it('is an alias for "integration add"', async () => {
      client.setArgv('install', 'acme');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({})
      );
    });

    it('forwards --name flag', async () => {
      client.setArgv('install', 'acme', '--name', 'my-db');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--name': 'my-db' })
      );
    });

    it('forwards -n shorthand', async () => {
      client.setArgv('install', 'acme', '-n', 'my-db');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--name': 'my-db' })
      );
    });

    it('forwards --metadata flags', async () => {
      client.setArgv(
        'install',
        'acme',
        '--metadata',
        'region=us-east-1',
        '--metadata',
        'version=16'
      );
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({
          '--metadata': ['region=us-east-1', 'version=16'],
        })
      );
    });

    it('forwards -m shorthand', async () => {
      client.setArgv('install', 'acme', '-m', 'region=us-east-1');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--metadata': ['region=us-east-1'] })
      );
    });

    it('forwards --plan flag', async () => {
      client.setArgv('install', 'acme', '--plan', 'pro');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--plan': 'pro' })
      );
    });

    it('forwards -p shorthand', async () => {
      client.setArgv('install', 'acme', '-p', 'pro');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--plan': 'pro' })
      );
    });

    it('forwards --no-connect flag', async () => {
      client.setArgv('install', 'acme', '--no-connect');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--no-connect': true })
      );
    });

    it('forwards --no-env-pull flag', async () => {
      client.setArgv('install', 'acme', '--no-env-pull');
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({ '--no-env-pull': true })
      );
    });

    it('forwards all flags together', async () => {
      client.setArgv(
        'install',
        'acme',
        '--name',
        'my-db',
        '--metadata',
        'region=us-east-1',
        '--plan',
        'pro',
        '--no-connect',
        '--no-env-pull'
      );
      await install(client);
      expect(addFromFlagsSpy).toHaveBeenCalledWith(
        client,
        ['acme'],
        expect.objectContaining({
          '--name': 'my-db',
          '--metadata': ['region=us-east-1'],
          '--plan': 'pro',
          '--no-connect': true,
          '--no-env-pull': true,
        })
      );
    });

    it('propagates exit code from add()', async () => {
      addFromFlagsSpy.mockResolvedValueOnce(1);
      client.setArgv('install', 'acme');
      const exitCode = await install(client);
      expect(exitCode).toEqual(1);
    });

    it('returns 0 on success', async () => {
      addFromFlagsSpy.mockResolvedValueOnce(0);
      client.setArgv('install', 'acme');
      const exitCode = await install(client);
      expect(exitCode).toEqual(0);
    });

    it('returns 1 for unknown flags', async () => {
      client.setArgv('install', 'acme', '--unknown-flag');
      const exitCode = await install(client);
      expect(exitCode).toEqual(1);
    });
  });
});
