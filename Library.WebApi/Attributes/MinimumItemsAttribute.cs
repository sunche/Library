using System;
using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace Library.WebApi.Attributes
{
    /// <summary>
    /// Attribute for validation items count.
    /// </summary>
    /// <seealso cref="System.ComponentModel.DataAnnotations.ValidationAttribute" />
    public class MinimumItemsAttribute : ValidationAttribute
    {
        private readonly int minItems;

        /// <summary>
        /// Initializes a new instance of the <see cref="MinimumItemsAttribute"/> class.
        /// </summary>
        /// <param name="minItems">The minimum items.</param>
        public MinimumItemsAttribute(int minItems)
        {
            this.minItems = minItems;
        }

        /// <summary>
        /// Returns true if cjllection is valid.
        /// </summary>
        /// <param name="value">The value of the object to validate.</param>
        /// <returns>
        /// true if the specified value is valid; otherwise, false.
        /// </returns>
        public override bool IsValid(object value)
        {
            if (value is ICollection list)
            {
                return list.Count >= minItems;
            }

            return false;
        }
    }
}
