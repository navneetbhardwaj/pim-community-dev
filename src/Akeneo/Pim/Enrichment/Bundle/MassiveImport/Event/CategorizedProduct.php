<?php

declare(strict_types=1);

namespace Akeneo\Pim\Enrichment\Bundle\MassiveImport\Event;

class CategorizedProduct
{
    /** @var string */
    private $identifier;

    /** @var string */
    private $categories;

    /**
     * @param string $productIdentifier
     * @param array  $categories
     */
    public function __construct(string $productIdentifier, array $categories)
    {
        $this->identifier = $productIdentifier;
        $this->categories = $categories;
    }

    public function productIdentifier(): string
    {
        return $this->productIdentifier;
    }

    public function categories(): array
    {
        return $this->categories;
    }
}