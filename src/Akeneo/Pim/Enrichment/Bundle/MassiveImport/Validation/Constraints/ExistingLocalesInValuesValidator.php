<?php

declare(strict_types=1);

namespace Akeneo\Pim\Enrichment\Bundle\MassiveImport\Validation\Constraints;

use Akeneo\Pim\Enrichment\Bundle\MassiveImport\Command\EditProductCommand;
use Akeneo\Pim\Enrichment\Component\Product\Batch\Api\Product\Product;
use Doctrine\DBAL\Connection;
use PDO;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

/**
 * @copyright 2018 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
class ExistingLocalesInValuesValidator extends ConstraintValidator
{
    /** @var Connection */
    private $connection;

    /**
     * @param Connection $connection
     */
    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    /**
     * {@inheritdoc}
     */
    public function validate($command, Constraint $constraint)
    {
        if (!$command instanceof EditProductCommand) {
            throw new UnexpectedTypeException($constraint, EditProductCommand::class);
        }

        if (!$constraint instanceof ExistingLocalesInValues) {
            throw new UnexpectedTypeException($constraint, ExistingLocalesInValues::class);
        }

        if (null === $command->values()) {
            return;
        }

        $sql = <<<SQL
            SELECT 
                code
            FROM 
                pim_catalog_locale l
            WHERE 
                l.code IN (:locale_codes)
                AND l.is_activated = 1
SQL;

        $localeCodes = $this->getLocaleCodes($command);
        $existingLocales = $this->connection->executeQuery(
            $sql,
            ['locale_codes' => $localeCodes],
            ['locale_codes' => \Doctrine\DBAL\Connection::PARAM_STR_ARRAY]
        )->fetchAll(PDO::FETCH_COLUMN, 0);

        $notExistingCode = array_diff($localeCodes, $existingLocales);

        if (!empty($notExistingCode)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }

    private function getLocaleCodes(EditProductCommand $command): array
    {
        $locales = [];
        foreach ($command->values()->all() as $value) {
            if (null !== $value->localeCode()) {
                $locales[$value->localeCode()] = $value->localeCode();
            }
        }

        return $locales;
    }
}