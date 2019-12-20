import {
  bindable,
  IController,
  INode,
  LifecycleFlags,
  customElement,
  CustomElement,
  ICompiledCustomElementController,
} from '@aurelia/runtime';
import { IRouter } from '../router';
import { IViewportScopeOptions, ViewportScope } from '../viewport-scope';
import { IContainer } from '@aurelia/kernel';

export const ParentViewportScope = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport-scope',
  template: '<template><template replaceable></template></template>',
  injectable: ParentViewportScope
})
export class ViewportScopeCustomElement {
  @bindable public name: string = 'default';
  @bindable public catches: string = '';
  @bindable public collection: boolean = false;
  @bindable public source: unknown[] | null = null;
  public viewportScope: ViewportScope | null = null;

  public $controller!: IController; // This is set by the controller after this instance is constructed

  private readonly element: Element;

  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @IContainer private container: IContainer,
    @ParentViewportScope private readonly parent: ViewportScopeCustomElement,
  ) {
    this.element = element as HTMLElement;
  }

  public afterCompile(controller: ICompiledCustomElementController) {
    this.container = controller.context.get(IContainer);
    // console.log('ViewportScope creating', this.getAttribute('name', this.name), this.container, this.parent, controller, this);
    // this.connect();
  }
  public afterUnbound(): void {
    this.isBound = false;
  }

  public connect(): void {
    if (this.router.rootScope === null) {
      return;
    }
    const name: string = this.getAttribute('name', this.name) as string;
    const options: IViewportScopeOptions = {};
    let value: string | boolean | undefined = this.getAttribute('catches', this.catches);
    if (value !== void 0) {
      options.catches = value as string;
    }
    value = this.getAttribute('collection', this.collection, true);
    if (value !== void 0) {
      options.collection = value as boolean;
    }

    // TODO: Needs to be bound? How to solve?
    options.source = this.source || null;

    this.viewportScope = this.router.connectViewportScope(this.viewportScope, name, this.container, this.element, options);
  }
  public disconnect(): void {
    if (this.viewportScope) {
      this.router.disconnectViewportScope(this.viewportScope, this.container);
    }
    this.viewportScope = null;
  }

  public beforeBind(flags: LifecycleFlags): void {
    this.isBound = true;
    this.connect();
    if (this.viewportScope !== null) {
      this.viewportScope.beforeBind();
    }
  }
  public async beforeUnbind(flags: LifecycleFlags): Promise<void> {
    if (this.viewportScope !== null) {
      this.viewportScope.beforeUnbind();
    }
    this.disconnect();
    return Promise.resolve();
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
    const result: Record<string, string | boolean> = {};
    if (this.isBound) {
      return value;
    } else {
      if (this.element.hasAttribute(key)) {
        if (checkExists) {
          return true;
        } else {
          value = this.element.getAttribute(key) as string;
          if (value.length > 0) {
            return value;
          }
        }
      }
    }
    return void 0;
  }
}
