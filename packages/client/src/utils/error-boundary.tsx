import { Component, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  component?: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  public render() {
    if (this.state.error) {
      if (this.props.component) {
        return this.props.component;
      } else {
        return <p>Произошла ошибка :(</p>;
      }
    }

    return this.props.children;
  }
}
