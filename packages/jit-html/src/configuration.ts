import { JitConfiguration } from '@aurelia/jit';
import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { ITemplateCompiler } from '@aurelia/runtime';
import { HTMLRuntimeConfiguration } from '@aurelia/runtime-html';
import {
  CaptureBindingCommand,
  DelegateBindingCommand,
  TriggerBindingCommand
} from './binding-command';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateFactory, ITemplateFactory } from './template-factory';

export const HTMLBindingLanguage: IRegistry[] = [
  TriggerBindingCommand,
  DelegateBindingCommand,
  CaptureBindingCommand
];

export const HTMLJitConfiguration = {
  register(container: IContainer): void {
    container.register(
      HTMLRuntimeConfiguration,
      JitConfiguration,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      Registration.singleton(ITemplateFactory, HTMLTemplateFactory),
      ...HTMLBindingLanguage
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(HTMLJitConfiguration);
    return container;
  }
};
