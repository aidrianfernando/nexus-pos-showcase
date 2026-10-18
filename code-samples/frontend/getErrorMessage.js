function appendRequestReference(message, error) {
  const requestId =
    error?.response?.data?.requestId ||
    error?.response?.headers?.['x-request-id'];

  return requestId
    ? `${message} Reference: ${requestId}`
    : message;
}

export default function getErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {
  if (
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  ) {
    return 'Unable to connect to the server. Please try again.';
  }

  if (error.response.status === 403) {
    return appendRequestReference(
      'You do not have permission to perform this action.',
      error
    );
  }

  return appendRequestReference(
    error.response?.data?.message || fallback,
    error
  );
}
