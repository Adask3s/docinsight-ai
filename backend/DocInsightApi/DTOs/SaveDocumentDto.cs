using System.ComponentModel.DataAnnotations;

namespace DocInsightApi.DTOs
{
    public class SaveDocumentDto
    {
        [Required]
        public string FileName { get; set; }

        [Required]
        public object Summary { get; set; }

        [Required]
        public object Classification { get; set; }

        [Required]
        public object Risk { get; set; }
    }
}
