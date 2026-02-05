using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DocInsightApi.Models;

namespace DocInsightApi.Data
{
    // EF Core - tutaj definiujemy strukturę bazy danych
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser> // <-- Identity
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

        public DbSet<Document> Documents { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder); // ważne dla tabel Identity

            // (opcjonalnie) jawna konfiguracja FK:
            // builder.Entity<Document>()
            //     .HasOne(d => d.User)
            //     .WithMany(u => u.Documents)
            //     .HasForeignKey(d => d.UserId)
            //     .OnDelete(DeleteBehavior.Cascade);
        }
    }
}