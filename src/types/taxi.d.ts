declare module "@unseenco/taxi" {
  export class Transition {
    constructor(options: { wrapper: HTMLElement });
    wrapper: HTMLElement;
    enter(options: {
      to: HTMLElement;
      trigger: string | HTMLElement | false;
    }): Promise<void>;
    onEnter(options: {
      to: HTMLElement;
      trigger: string | HTMLElement | false;
      done: () => void;
    }): void;
  }
}
