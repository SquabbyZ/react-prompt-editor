export interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}
