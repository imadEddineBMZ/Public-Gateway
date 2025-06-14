/* tslint:disable */
/* eslint-disable */
// Generated by Microsoft Kiota
// @ts-ignore
import { createGetUserByIdEndpointResponseFromDiscriminatorValue, type GetUserByIdEndpointResponse } from '../models/index.js';
// @ts-ignore
import { type BaseRequestBuilder, type Parsable, type ParsableFactory, type RequestConfiguration, type RequestInformation, type RequestsMetadata } from '@microsoft/kiota-abstractions';

/**
 * Builds and executes requests for operations under /user
 */
export interface UserRequestBuilder extends BaseRequestBuilder<UserRequestBuilder> {
    /**
     * @param requestConfiguration Configuration for the request such as headers, query parameters, and middleware options.
     * @returns {Promise<GetUserByIdEndpointResponse>}
     */
     get(requestConfiguration?: RequestConfiguration<UserRequestBuilderGetQueryParameters> | undefined) : Promise<GetUserByIdEndpointResponse | undefined>;
    /**
     * @param requestConfiguration Configuration for the request such as headers, query parameters, and middleware options.
     * @returns {RequestInformation}
     */
     toGetRequestInformation(requestConfiguration?: RequestConfiguration<UserRequestBuilderGetQueryParameters> | undefined) : RequestInformation;
}
export interface UserRequestBuilderGetQueryParameters {
    userId?: string;
}
/**
 * Uri template for the request builder.
 */
export const UserRequestBuilderUriTemplate = "{+baseurl}/user?userId={userId}";
/**
 * Metadata for all the requests in the request builder.
 */
export const UserRequestBuilderRequestsMetadata: RequestsMetadata = {
    get: {
        uriTemplate: UserRequestBuilderUriTemplate,
        responseBodyContentType: "application/json",
        adapterMethodName: "send",
        responseBodyFactory:  createGetUserByIdEndpointResponseFromDiscriminatorValue,
    },
};
/* tslint:enable */
/* eslint-enable */
