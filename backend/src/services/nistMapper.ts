import { MediaType, WipeScope, NistCategory, WipeMethod } from '@prisma/client';

export interface WipeRecommendations {
  recommendedMethod: WipeMethod;
  rationale: string;
  verificationRequirements: {
    samplePercent: number;
    readBackRequired: boolean;
  };
  warnings: string[];
  estimatedDuration: string;
}

export class NistMapper {
  getRecommendations(
    mediaType: MediaType,
    scope: WipeScope,
    nistCategory: NistCategory
  ): WipeRecommendations {
    const recommendations: WipeRecommendations = {
      recommendedMethod: 'OVERWRITE',
      rationale: '',
      verificationRequirements: {
        samplePercent: 10,
        readBackRequired: true,
      },
      warnings: [],
      estimatedDuration: '30-60 minutes',
    };

    // HDD recommendations
    if (mediaType === 'HDD') {
      if (nistCategory === 'CLEAR') {
        recommendations.recommendedMethod = 'OVERWRITE';
        recommendations.rationale = 'Multi-pass overwrite suitable for HDD Clear category per NIST SP 800-88';
        recommendations.verificationRequirements.samplePercent = 5;
        recommendations.estimatedDuration = '15-30 minutes';
      } else if (nistCategory === 'PURGE') {
        recommendations.recommendedMethod = 'ATA_SECURE_ERASE';
        recommendations.rationale = 'ATA Secure Erase provides lab-resistant sanitization for HDD';
        recommendations.verificationRequirements.samplePercent = 15;
        recommendations.estimatedDuration = '30-90 minutes';
      } else if (nistCategory === 'DESTROY') {
        recommendations.recommendedMethod = 'OVERWRITE';
        recommendations.rationale = 'Multiple overwrite passes followed by physical destruction';
        recommendations.verificationRequirements.samplePercent = 25;
        recommendations.warnings.push('Physical destruction required after software sanitization');
        recommendations.estimatedDuration = '60+ minutes';
      }
    }

    // SSD/NVMe recommendations
    if (mediaType === 'SSD' || mediaType === 'NVME') {
      if (nistCategory === 'CLEAR') {
        recommendations.recommendedMethod = 'CRYPTO_ERASE';
        recommendations.rationale = 'Cryptographic erase effective for SSD/NVMe Clear category';
        recommendations.verificationRequirements.readBackRequired = false;
        recommendations.estimatedDuration = '5-15 minutes';
      } else if (nistCategory === 'PURGE') {
        recommendations.recommendedMethod = 'NVME_SANITIZE';
        recommendations.rationale = 'NVMe Sanitize command provides comprehensive SSD sanitization';
        recommendations.verificationRequirements.samplePercent = 0;
        recommendations.verificationRequirements.readBackRequired = false;
        recommendations.estimatedDuration = '15-45 minutes';
      } else if (nistCategory === 'DESTROY') {
        recommendations.recommendedMethod = 'NVME_SANITIZE';
        recommendations.rationale = 'NVMe Sanitize followed by physical destruction';
        recommendations.warnings.push('Physical destruction required for DESTROY category');
        recommendations.estimatedDuration = '30-60 minutes';
      }

      // SSD-specific warnings
      recommendations.warnings.push(
        'SSD wear-leveling may leave data in unmapped areas. Controller-level sanitization preferred.'
      );
    }

    // Flash/Removable media
    if (mediaType === 'FLASH' || mediaType === 'REMOVABLE') {
      recommendations.recommendedMethod = 'OVERWRITE';
      recommendations.rationale = 'Multiple overwrite passes for flash media';
      recommendations.warnings.push('Flash memory may have wear-leveling - complete sanitization not guaranteed');
      recommendations.estimatedDuration = '10-30 minutes';
    }

    // Folder-specific adjustments
    if (scope === 'FOLDER') {
      recommendations.recommendedMethod = 'OVERWRITE';
      recommendations.rationale += ' File-level overwrite with freespace wiping on containing volume';
      recommendations.warnings.push(
        'Folder wipe cannot sanitize file system metadata and may leave traces in unallocated space'
      );
    }

    return recommendations;
  }

  validateMethodForMedia(mediaType: MediaType, method: WipeMethod): boolean {
    const validCombinations: Record<MediaType, WipeMethod[]> = {
      HDD: ['OVERWRITE', 'ATA_SECURE_ERASE'],
      SSD: ['OVERWRITE', 'CRYPTO_ERASE', 'NVME_SANITIZE'],
      NVME: ['CRYPTO_ERASE', 'NVME_SANITIZE', 'OVERWRITE'],
      FLASH: ['OVERWRITE'],
      REMOVABLE: ['OVERWRITE'],
    };

    return validCombinations[mediaType]?.includes(method) || false;
  }
}