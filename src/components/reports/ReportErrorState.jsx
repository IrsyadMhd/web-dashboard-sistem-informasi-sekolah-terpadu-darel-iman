import React from 'react'
import { RefreshCw } from 'lucide-react'
import { Alert, AlertIndicator, AlertContent, AlertTitle, AlertDescription } from '@/components/tailgrids/core/alert'
import { Button } from '@/components/tailgrids/core/button'

export function ReportErrorState({ onRetry }) {
  return (
    <div className="py-6">
      <Alert status="error">
        <AlertIndicator />
        <AlertContent>
          <AlertTitle>Laporan Tidak Dapat Dimuat</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan koneksi atau pengolahan data pada server. Silakan coba kembali beberapa saat lagi.
          </AlertDescription>
          {onRetry && (
            <div className="mt-4">
              <Button size="sm" variant="danger" appearance="outline" onClick={onRetry} prefixIcon={<RefreshCw className="h-4 w-4" />}>
                Coba Lagi
              </Button>
            </div>
          )}
        </AlertContent>
      </Alert>
    </div>
  )
}

