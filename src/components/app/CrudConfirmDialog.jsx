"use client";

import React from "react";
import { AlertDialog } from "@/components/tailgrids/core/alert-dialog";
import { Button } from "@/components/tailgrids/core/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Warning, CheckCircle, Trash1, InfoCircle } from "@tailgrids/icons";

/**
 * CrudConfirmDialog - TailGrids UI Standard CRUD Confirmation Modal
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Is dialog open
 * @param {function} props.onOpenChange - Open state change handler
 * @param {function} props.onClose - Close handler
 * @param {'create'|'update'|'delete'|'custom'} props.type - Action type
 * @param {string} [props.title] - Modal title
 * @param {string} [props.description] - Modal description / details
 * @param {string} [props.confirmText] - Confirm button label
 * @param {string} [props.cancelText] - Cancel button label
 * @param {function} props.onConfirm - Confirm callback
 * @param {boolean} [props.isLoading=false] - Loading state for confirm action
 */
export function CrudConfirmDialog({
  isOpen,
  onOpenChange,
  onClose,
  type = "create",
  title,
  description,
  confirmText,
  cancelText = "Batal",
  onConfirm,
  isLoading = false,
}) {
  const handleOpenChange = (open) => {
    if (onOpenChange) onOpenChange(open);
    if (!open && onClose) onClose();
  };

  const handleConfirm = async (e) => {
    e?.preventDefault();
    if (onConfirm) {
      await onConfirm();
    }
    handleOpenChange(false);
  };

  // Determine defaults based on type
  let defaultTitle = "Konfirmasi Tindakan";
  let defaultDesc = "Apakah Anda yakin ingin melanjutkan tindakan ini?";
  let defaultBtnText = "Konfirmasi";
  let variant = "primary";
  let Icon = InfoCircle;
  let iconBg = "bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400";

  if (type === "create") {
    defaultTitle = "Konfirmasi Simpan Data";
    defaultDesc = "Apakah Anda yakin ingin menambahkan dan menyimpan data baru ini ke dalam sistem?";
    defaultBtnText = "Simpan Data";
    variant = "primary";
    Icon = CheckCircle;
    iconBg = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400";
  } else if (type === "update") {
    defaultTitle = "Konfirmasi Ubah Data";
    defaultDesc = "Apakah Anda yakin ingin menyimpan perubahan data ini? Perubahan akan langsung diperbarui.";
    defaultBtnText = "Simpan Perubahan";
    variant = "primary";
    Icon = Warning;
    iconBg = "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400";
  } else if (type === "delete") {
    defaultTitle = "Konfirmasi Hapus Data";
    defaultDesc = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat permanen dan data tidak dapat dikembalikan.";
    defaultBtnText = "Ya, Hapus Data";
    variant = "danger";
    Icon = Trash1;
    iconBg = "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400";
  }

  const finalTitle = title || defaultTitle;
  const finalDesc = description || defaultDesc;
  const finalConfirmText = confirmText || defaultBtnText;

  if (!isOpen) return null;

  return (
    <OverlayWrapper>
      <AlertDialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {finalTitle}
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                {finalDesc}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <DialogClose
            appearance="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </DialogClose>
          <Button
            variant={variant}
            size="sm"
            onClick={handleConfirm}
            pending={isLoading}
            disabled={isLoading}
          >
            {finalConfirmText}
          </Button>
        </DialogFooter>
      </AlertDialog>
    </OverlayWrapper>
  );
}

export default CrudConfirmDialog;
