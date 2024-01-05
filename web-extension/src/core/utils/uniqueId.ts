export default function generateUniqueId() {
    return Math.random().toString(16).slice(2);
}