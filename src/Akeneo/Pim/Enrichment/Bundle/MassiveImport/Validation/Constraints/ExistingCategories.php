<?php

declare(strict_types=1);

namespace Akeneo\Pim\Enrichment\Bundle\MassiveImport\Validation\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @copyright 2018 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
class ExistingCategories extends Constraint
{
    public $message = 'One of the category does not exist.';

    /**
     * {@inheritdoc}
     */
    public function validatedBy(): string
    {
        return 'batch_api_existing_categories';
    }

    /**
     * {@inheritdoc}
     */
    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}