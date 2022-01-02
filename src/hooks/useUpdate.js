export default function useUpdate() {
  const [, setState] = React.useState({})
  return React.useCallback(() => setState({}), [])
}