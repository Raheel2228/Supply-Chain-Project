// Placeholder type definition, until SpreadJS Designer includes its own
declare module '@grapecity/spread-sheets-designer-react' {
  interface DesignerProps {
    config?: any,
    styleInfo?: any,
    designerInitialized?: (designer: any) => void,
    children?: never;
  }
  declare class Designer extends React.Component<DesignerProps, {}> {}
}

declare module '@grapecity/spread-sheets-designer-resources-en';