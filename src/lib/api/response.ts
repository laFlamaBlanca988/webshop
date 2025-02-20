import { NextResponse } from "next/server";
import { ApiResponse, PaginatedResponse } from "@/types";

export const createApiResponse = <T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({ data }, { status });
};

export const createErrorResponse = (
  error: string,
  status: number = 500,
  details?: unknown
): NextResponse => {
  const response: { error: string; details?: unknown } = { error };
  if (details) {
    response.details = details;
  }
  return NextResponse.json(response, { status });
};

export const createPaginatedResponse = <T>(
  response: PaginatedResponse<T>
): NextResponse<PaginatedResponse<T>> => {
  return NextResponse.json(response);
};
