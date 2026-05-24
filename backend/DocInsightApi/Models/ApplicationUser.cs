using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace DocInsightApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Relacja 1:N → User → Documents
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }
}
