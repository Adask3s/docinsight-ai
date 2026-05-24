using DocInsightApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace DocInsightApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public ChatController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost]
        public async Task<IActionResult> ChatWithDocument([FromBody] ChatRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pythonEndpoint = "http://localhost:8000/chat"; // mikroserwis Python

            var payload = new
            {
                text = request.Text,
                question = request.Question
            };
            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            Console.WriteLine(json); // sprawdzamy, czy jest poprawny
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(pythonEndpoint, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            return Content(responseBody, "application/json");
        }
    }

}
