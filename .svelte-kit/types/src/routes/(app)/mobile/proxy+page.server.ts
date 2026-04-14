// @ts-nocheck
import type { PageServerLoad } from './$types';
import { mobilePageData } from '$lib/features/mobile/data';

export const load = () => ({ payload: mobilePageData });
;null as any as PageServerLoad;