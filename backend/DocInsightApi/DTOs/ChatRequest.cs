using System.ComponentModel.DataAnnotations;

namespace DocInsightApi.DTOs
{
    public class ChatRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "Text cannot be empty.")]
        public string Text { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Question cannot be empty.")]
        public string Question { get; set; }
    }
}
