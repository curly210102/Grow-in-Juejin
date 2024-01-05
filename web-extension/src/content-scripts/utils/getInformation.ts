export function getCurrentUserId() {
    const match = window.location.pathname.match(/\/user\/(\d+)/);
    return match ? match[1] : ""
}

