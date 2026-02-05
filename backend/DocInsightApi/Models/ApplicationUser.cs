using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace DocInsightApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Relacja 1:N → User → Documents
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

public class Document
    {
        [Key]
        public int Id { get; set; }

        public string FileName { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public string SummaryJson { get; set; }
        public string ClassificationJson { get; set; }
        public string RiskJson { get; set; }

        // FK do właściciela dokumentu (na razie opcjonalny, dopóki nie włączymy Auth w UI)
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
    }
}