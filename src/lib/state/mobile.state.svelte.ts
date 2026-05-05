/*
 * mobile.state.svelte.ts
 * Purpose: Svelte 5 state owner for the mobile MBTI flow.
 */
import { createEmptySelection, type MobileScreen, type MobileSelection } from '../services/mobile/mobile.logic';

export type MobileFlowState = {
  screen: MobileScreen;
  selection: MobileSelection;
  loading: boolean;
  imageUrl: string | null;
};

export const mobileFlow = $state<MobileFlowState>({
  screen: 'welcome',
  selection: createEmptySelection(),
  loading: false,
  imageUrl: null
});

export function resetMobileFlow(): void {
  mobileFlow.screen = 'welcome';
  mobileFlow.selection = createEmptySelection();
  mobileFlow.loading = false;
  mobileFlow.imageUrl = null;
}

export function setMobileScreen(screen: MobileScreen): void {
  mobileFlow.screen = screen;
}

export function setMobileLoading(loading: boolean): void {
  mobileFlow.loading = loading;
}

export function setMobileImageUrl(imageUrl: string | null): void {
  mobileFlow.imageUrl = imageUrl;
}