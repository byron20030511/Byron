$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()

Write-Host "Serving http://localhost:8000/"
Write-Host "Press Ctrl+C to stop."

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()

    try {
      $path = $context.Request.Url.AbsolutePath.TrimStart("/")

      if ([string]::IsNullOrWhiteSpace($path)) {
        $path = "index.html"
      }

      $file = Join-Path (Get-Location) $path

      if (Test-Path $file -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $extension = [System.IO.Path]::GetExtension($file).ToLowerInvariant()

        switch ($extension) {
          ".html" { $context.Response.ContentType = "text/html; charset=utf-8" }
          ".css" { $context.Response.ContentType = "text/css; charset=utf-8" }
          ".js" { $context.Response.ContentType = "application/javascript; charset=utf-8" }
          ".json" { $context.Response.ContentType = "application/json; charset=utf-8" }
          ".png" { $context.Response.ContentType = "image/png" }
          ".jpg" { $context.Response.ContentType = "image/jpeg" }
          ".jpeg" { $context.Response.ContentType = "image/jpeg" }
          ".gif" { $context.Response.ContentType = "image/gif" }
          ".svg" { $context.Response.ContentType = "image/svg+xml" }
          ".ogg" { $context.Response.ContentType = "audio/ogg" }
          ".mp3" { $context.Response.ContentType = "audio/mpeg" }
          ".fbx" { $context.Response.ContentType = "application/octet-stream" }
          ".vrm" { $context.Response.ContentType = "model/gltf-binary" }
          ".glb" { $context.Response.ContentType = "model/gltf-binary" }
          ".ttf" { $context.Response.ContentType = "font/ttf" }
          ".otf" { $context.Response.ContentType = "font/otf" }
          default { $context.Response.ContentType = "application/octet-stream" }
        }

        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $context.Response.StatusCode = 404
      }
    } catch {
      Write-Host ("Request failed: " + $_.Exception.Message)
    } finally {
      try {
        $context.Response.OutputStream.Close()
      } catch {
      }
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
