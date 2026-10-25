import { RefObject, useEffect, useState } from "react"

type ChatScrollProps = {
    chatRef: RefObject<HTMLDivElement | null>;
    bottomRef: RefObject<HTMLDivElement | null>;
    shouldLoadMore: boolean;
    loadMore: () => void;
    count: number;
}

// How close (px) to the bottom still counts as "at the bottom" for auto-scrolling on new messages.
const BOTTOM_THRESHOLD = 100;

// Loads older messages when the list is scrolled to the top, and keeps it pinned to the newest message.
export const useChatScroll = ({
    chatRef,
    bottomRef,
    shouldLoadMore,
    loadMore,
    count
}: ChatScrollProps) => {
    // Set after the first scroll-to-bottom so later renders only follow when the user is already near the bottom.
    const [hasInitialized, setHasInitialized] = useState(false);

    // Fetch the previous page once the user reaches the top.
    useEffect(() => {
        const topDiv = chatRef.current;

        if (!topDiv) return;

        const handleScroll = () => {
            if (topDiv.scrollTop === 0 && shouldLoadMore) {
                loadMore();
            }
        };

        topDiv.addEventListener("scroll", handleScroll);

        return () => {
            topDiv.removeEventListener("scroll", handleScroll);
        };
    }, [shouldLoadMore, loadMore, chatRef]);

    // Jump to the newest message on first load, then follow new messages only if the user is near the bottom.
    useEffect(() => {
        const bottomDiv = bottomRef.current;
        const topDiv = chatRef.current;

        if (!topDiv || !bottomDiv) return;

        const shouldAutoScroll = () => {
            if (!hasInitialized) {
                setHasInitialized(true);
                return true;
            }

            const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

            return distanceFromBottom <= BOTTOM_THRESHOLD;
        };

        if (shouldAutoScroll()) {
            // Wait a tick so the new message has been laid out before scrolling.
            const timeout = setTimeout(() => {
                bottomDiv.scrollIntoView({ behavior: "smooth" });
            }, 100);

            return () => clearTimeout(timeout);
        }
    }, [bottomRef, chatRef, count, hasInitialized]);
}
