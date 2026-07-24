using GymBackend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var maxRetries = 10;
    var retryDelay = TimeSpan.FromSeconds(3);

    for (int i = 1; i <= maxRetries; i++)
    {
        try
        {
            db.Database.EnsureCreated();
            Console.WriteLine("Base de datos inicializada correctamente.");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Intento {i}/{maxRetries}: no se pudo conectar a la base de datos.");
            Console.WriteLine(ex.Message);

            if (i == maxRetries)
            {
                throw;
            }

            Thread.Sleep(retryDelay);
        }
    }
}

app.Run();