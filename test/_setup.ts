import {Headers, Request, Response} from 'cross-fetch';

(global as any).Headers = Headers;
(global as any).Request = Request;
(global as any).Response = Response;
