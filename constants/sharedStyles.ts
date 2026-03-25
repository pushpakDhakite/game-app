import { StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';

export const sharedStyles = StyleSheet.create({
  // Cards
  cardBase: {
    backgroundColor: GameColors.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: GameColors.borderLight,
  },
  cardNoShadow: {
    backgroundColor: GameColors.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: GameColors.borderLight,
  },

  // Section titles
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: GameColors.textPrimary,
  },

  // Buy rows
  buyRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  buyRowInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  buyRowEmoji: {
    fontSize: 28,
  },
  buyRowDetails: {
    flex: 1,
  },
  buyRowName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: GameColors.textPrimary,
  },
  buyRowEffect: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GameColors.buttonPrimary,
  },
  costBadge: {
    backgroundColor: GameColors.buttonSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  costBadgeSmall: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  costText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GameColors.white,
  },
  costTextSmall: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: GameColors.white,
  },

  // Buttons
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
    gap: 6,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: GameColors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Goal progress
  goalProgressBg: {
    height: 16,
    backgroundColor: GameColors.white,
    borderRadius: 8,
    overflow: 'hidden' as const,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: GameColors.lemonYellow,
    borderRadius: 8,
  },
  goalStats: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
});
