import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
  AnimationMetadata,
} from '@angular/animations';

// iOS 26-inspired slide animation
export const slideAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0,
      }),
    ], { optional: true }),
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px)',
      }),
    ], { optional: true }),
    query(':leave', [
      animate('200ms cubic-bezier(0.4, 0, 1, 1)', style({
        opacity: 0,
        transform: 'translateY(-20px)',
      })),
    ], { optional: true }),
    query(':enter', [
      animate('300ms 100ms cubic-bezier(0, 0, 0.2, 1)', style({
        opacity: 1,
        transform: 'translateY(0)',
      })),
    ], { optional: true }),
  ]),
]);

// Fade animation for simple transitions
export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 }),
    ], { optional: true }),
    query(':leave', [
      animate('150ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0 })),
    ], { optional: true }),
    query(':enter', [
      animate('250ms 100ms cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 1 })),
    ], { optional: true }),
  ]),
]);

// Scale animation for modals/overlays
export const scaleAnimation = trigger('scaleAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'scale(0.95)',
    }),
    animate('250ms cubic-bezier(0, 0, 0.2, 1)', style({
      opacity: 1,
      transform: 'scale(1)',
    })),
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.4, 0, 1, 1)', style({
      opacity: 0,
      transform: 'scale(0.95)',
    })),
  ]),
]);

// Slide from right animation (like iOS navigation push)
export const slideFromRightAnimation = trigger('slideFromRight', [
  transition(':enter', [
    style({
      transform: 'translateX(100%)',
      opacity: 0,
    }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      transform: 'translateX(0)',
      opacity: 1,
    })),
  ]),
  transition(':leave', [
    animate('250ms cubic-bezier(0.4, 0, 1, 1)', style({
      transform: 'translateX(-30%)',
      opacity: 0,
    })),
  ]),
]);

// Slide from bottom animation (like iOS modal present)
export const slideFromBottomAnimation = trigger('slideFromBottom', [
  transition(':enter', [
    style({
      transform: 'translateY(100%)',
      opacity: 0,
    }),
    animate('350ms cubic-bezier(0.4, 0, 0.2, 1)', style({
      transform: 'translateY(0)',
      opacity: 1,
    })),
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 1, 1)', style({
      transform: 'translateY(100%)',
      opacity: 0,
    })),
  ]),
]);
