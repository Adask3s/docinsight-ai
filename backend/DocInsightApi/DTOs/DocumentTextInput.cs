using System.ComponentModel.DataAnnotations;

namespace DocInsightApi.DTOs
{
    public class DocumentTextInput
    {
        [Required]
        [MinLength(1, ErrorMessage = "Text cannot be empty.")]
        public string Text { get; set; }
    }
}
