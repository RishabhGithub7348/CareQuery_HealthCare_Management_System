export function setupSync(callback: () => void) {
  const channel = new BroadcastChannel("carequery");
  channel.onmessage = (event) => {
    if (event.data === "user-update") {
      callback();
    }
  };
  return () => channel.close();
}
