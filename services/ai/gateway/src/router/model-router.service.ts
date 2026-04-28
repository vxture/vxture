import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ClaudeProvider } from '../providers/claude.provider';
import { DoubaoProvider } from '../providers/doubao.provider';
import { PrivateModelProvider } from '../providers/private.provider';
import type { IModelProvider } from '../types/gateway.types';

@Injectable()
export class ModelRouterService {
  private readonly providers: ReadonlyMap<string, IModelProvider>;

  constructor(
    @Inject(DoubaoProvider)
    doubaoProvider: DoubaoProvider,
    @Inject(ClaudeProvider)
    claudeProvider: ClaudeProvider,
    @Inject(PrivateModelProvider)
    privateProvider: PrivateModelProvider,
  ) {
    this.providers = new Map<string, IModelProvider>([
      [doubaoProvider.providerName, doubaoProvider],
      [claudeProvider.providerName, claudeProvider],
      ['anthropic', claudeProvider],
      [privateProvider.providerName, privateProvider],
      ['custom', privateProvider],
      ['self-hosted', privateProvider],
    ]);
  }

  resolve(providerName: string): IModelProvider {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new NotFoundException(`AI provider "${providerName}" is not supported`);
    }

    return provider;
  }
}
