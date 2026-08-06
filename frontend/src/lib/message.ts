type SenderRef = string | { _id?: string | null } | null | undefined;

const toStringId = (value: unknown): string => {
	if (value === null || value === undefined) {
		return "";
	}

	return String(value);
};

export const getSenderId = (senderId: SenderRef): string => {
	if (!senderId) {
		return "";
	}

	if (typeof senderId === "string") {
		return senderId;
	}

	return toStringId(senderId._id);
};

export const isOwnMessage = (
	senderId: SenderRef,
	currentUserId?: string | null,
): boolean => {
	if (!currentUserId) {
		return false;
	}

	return getSenderId(senderId) === toStringId(currentUserId);
};