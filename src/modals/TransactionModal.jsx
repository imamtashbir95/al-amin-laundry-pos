import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
    Button,
    Card,
    CardContent,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { ProductContext } from "../contexts/ProductContext";
import { transactionSchema } from "../zod/transactionSchema";
import { CustomerContext } from "../contexts/CustomerContext";
import { TransactionContext } from "../contexts/TransactionContext";
import "dayjs/locale/en-gb";

const TransactionModal = ({ onClose, transaction }) => {
    const form = useForm({
        defaultValues: {
            invoiceId: "",
            customer: {
                name: "",
                phoneNumber: "",
                address: "",
            },
            product: {
                name: "",
                price: "",
                type: "",
            },
            qty: "",
            price: "",
            finishDate: new Date().toISOString(),
            paymentStatus: "",
            status: "",
        },
        resolver: zodResolver(transactionSchema),
    });

    const { addTransaction, updateTransaction } =
        useContext(TransactionContext);
    const { products } = useContext(ProductContext);
    const { customers } = useContext(CustomerContext);
    const { customerId } = useParams();

    const selectedCustomer = customers.find(
        (customer) => customer.id === customerId,
    );

    useEffect(() => {
        if (transaction) {
            form.reset({
                invoiceId: transaction?.invoiceId || "",
                customer: {
                    name: selectedCustomer?.name || "",
                    phoneNumber: selectedCustomer?.phoneNumber || "",
                    address: selectedCustomer?.address || "",
                },
                product: {
                    name: transaction?.product?.name || "",
                    price: transaction?.product?.price || "",
                    type: transaction?.product?.type || "",
                },
                qty: String(transaction?.qty) || "",
                price: transaction?.price || "",
                finishDate: transaction?.finishDate || new Date().toISOString(),
                paymentStatus: transaction?.paymentStatus || "",
                status: transaction?.status || "",
            });
        }
    }, [transaction, selectedCustomer, form]);

    useEffect(() => {
        const product = form.watch("product");
        const qty = form.watch("qty");

        const total = product?.price * (Math.ceil(qty) || 0);
        if (!isNaN(total)) {
            form.setValue("price", total.toString());
        }
    }, [form.watch("product"), form.watch("qty")]);

    useEffect(() => {
        console.log(transaction);
    }, [transaction]);

    const handleTransactionSubmit = () => {
        const finalData = form.getValues();

        const selectedCustomer = customers.find(
            (customer) => customer.name === finalData.customer.name,
        );
        const selectedProduct = products.find(
            (product) => product.name === finalData.product.name,
        );

        finalData.qty = parseInt(finalData.qty, 10);
        if (transaction && transaction.id) {
            const requestData = {
                id: transaction.billId,
                customerId: selectedCustomer.id,
                billDetails: [
                    {
                        id: transaction.id,
                        invoiceId: transaction.invoiceId,
                        product: {
                            id: selectedProduct.id,
                        },
                        qty: finalData.qty,
                        paymentStatus: finalData.paymentStatus,
                        status: finalData.status,
                        finishDate: finalData.finishDate,
                    },
                ],
            };
            updateTransaction(requestData);
            console.log(requestData);
        } else {
            const requestData = {
                customerId: selectedCustomer.id,
                billDetails: [
                    {
                        invoiceId: finalData.invoiceId,
                        product: {
                            id: selectedProduct.id,
                        },
                        qty: finalData.qty,
                        paymentStatus: finalData.paymentStatus,
                        status: finalData.status,
                        finishDate: finalData.finishDate,
                    },
                ],
            };
            addTransaction(requestData);
        }
        onClose();
    };

    return (
        <>
            <div className="fixed top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <Card
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(12px)",
                        width: "40rem",
                        "@media (max-width: 36rem)": {
                            width: "calc(100vw - 2rem)",
                        },
                    }}
                >
                    <CardContent>
                        <form
                            onSubmit={form.handleSubmit(
                                handleTransactionSubmit,
                            )}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex h-full w-full flex-col gap-4 max-lg:overflow-x-scroll">
                                <div className="flex gap-4 max-lg:w-[40rem]">
                                    <div className="flex w-[20rem] flex-col gap-4">
                                        <Controller
                                            name="invoiceId"
                                            control={form.control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <>
                                                        <InputLabel id="text-invoice-id">
                                                            No. Nota
                                                        </InputLabel>
                                                        <TextField
                                                            {...field}
                                                            size="small"
                                                            placeholder="No. Nota"
                                                            type="number"
                                                            error={
                                                                fieldState.invalid
                                                            }
                                                            helperText={
                                                                fieldState.error
                                                                    ?.message
                                                            }
                                                        />
                                                    </>
                                                );
                                            }}
                                        ></Controller>
                                        <Controller
                                            name="customer"
                                            control={form.control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <>
                                                        <InputLabel id="select-customer-label">
                                                            Pelanggan
                                                        </InputLabel>
                                                        <FormControl
                                                            error={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <Select
                                                                {...field}
                                                                displayEmpty
                                                                labelId="select-customer-label"
                                                                id="select-customer"
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const selectedCustomer =
                                                                        customers.find(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.name ===
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        );
                                                                    field.onChange(
                                                                        selectedCustomer,
                                                                    );
                                                                }}
                                                                value={
                                                                    field.value
                                                                        ?.name ||
                                                                    ""
                                                                }
                                                                size="small"
                                                            >
                                                                <MenuItem
                                                                    disabled
                                                                    value=""
                                                                >
                                                                    <em>
                                                                        Pilih
                                                                        Pelanggan
                                                                    </em>
                                                                </MenuItem>
                                                                {customers.map(
                                                                    (
                                                                        item,
                                                                        index,
                                                                    ) => (
                                                                        <MenuItem
                                                                            key={
                                                                                index
                                                                            }
                                                                            value={
                                                                                item.name
                                                                            }
                                                                        >
                                                                            {`${item.phoneNumber} ${item.name}`}
                                                                        </MenuItem>
                                                                    ),
                                                                )}
                                                            </Select>
                                                            {fieldState.error && (
                                                                <FormHelperText>
                                                                    {
                                                                        fieldState
                                                                            .error
                                                                            .name
                                                                            .message
                                                                    }
                                                                </FormHelperText>
                                                            )}
                                                        </FormControl>
                                                    </>
                                                );
                                            }}
                                        ></Controller>
                                        <Controller
                                            name="product"
                                            control={form.control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <>
                                                        <InputLabel id="select-laundry-package-label">
                                                            Paket Laundry
                                                        </InputLabel>
                                                        <FormControl
                                                            error={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <Select
                                                                {...field}
                                                                displayEmpty
                                                                labelId="select-laundry-package-label"
                                                                id="select-laundry-package"
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const selectedPackage =
                                                                        products.find(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.name ===
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        );
                                                                    field.onChange(
                                                                        selectedPackage ||
                                                                            "",
                                                                    );
                                                                }}
                                                                value={
                                                                    field.value
                                                                        ?.name
                                                                }
                                                                size="small"
                                                            >
                                                                <MenuItem
                                                                    disabled
                                                                    value=""
                                                                >
                                                                    <em>
                                                                        Pilih
                                                                        Paket
                                                                        Laundry
                                                                    </em>
                                                                </MenuItem>
                                                                {products.map(
                                                                    (
                                                                        item,
                                                                        index,
                                                                    ) => (
                                                                        <MenuItem
                                                                            key={
                                                                                index
                                                                            }
                                                                            value={
                                                                                item.name
                                                                            }
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </MenuItem>
                                                                    ),
                                                                )}
                                                            </Select>
                                                            {fieldState.error && (
                                                                <FormHelperText>
                                                                    {
                                                                        fieldState
                                                                            .error
                                                                            .name
                                                                            .message
                                                                    }
                                                                </FormHelperText>
                                                            )}
                                                        </FormControl>
                                                    </>
                                                );
                                            }}
                                        ></Controller>
                                    </div>
                                    <div className="flex w-[20rem] flex-col gap-4">
                                        <Controller
                                            name="finishDate"
                                            control={form.control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <>
                                                        <InputLabel id="text-finish-date-label">
                                                            Tanggal Selesai
                                                        </InputLabel>
                                                        <LocalizationProvider
                                                            dateAdapter={
                                                                AdapterDayjs
                                                            }
                                                            adapterLocale="en-gb"
                                                        >
                                                            <DatePicker
                                                                value={
                                                                    field.value
                                                                        ? dayjs(
                                                                              field.value,
                                                                          )
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    newValue,
                                                                ) =>
                                                                    field.onChange(
                                                                        newValue
                                                                            ? newValue.toISOString()
                                                                            : null,
                                                                    )
                                                                }
                                                                disablePast
                                                                slotProps={{
                                                                    textField: {
                                                                        size: "small",
                                                                        error: fieldState.invalid,
                                                                        helperText:
                                                                            fieldState
                                                                                .error
                                                                                ?.message,
                                                                    },
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    </>
                                                );
                                            }}
                                        ></Controller>
                                        <Controller
                                            name="paymentStatus"
                                            control={form.control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <>
                                                        <InputLabel id="select-payment-status-label">
                                                            Dibayar
                                                        </InputLabel>
                                                        <FormControl
                                                            error={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <Select
                                                                {...field}
                                                                displayEmpty
                                                                labelId="select-payment-status-label"
                                                                id="select-payment-status"
                                                                size="small"
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    field.onChange(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    );
                                                                }}
                                                                value={
                                                                    field.value ||
                                                                    ""
                                                                }
                                                            >
                                                                <MenuItem
                                                                    disabled
                                                                    value=""
                                                                >
                                                                    <em>
                                                                        Pilih
                                                                        Status
                                                                        Pembayaran
                                                                    </em>
                                                                </MenuItem>
                                                                {[
                                                                    {
                                                                        value: "belum-dibayar",
                                                                        label: "Belum Dibayar",
                                                                    },
                                                                    {
                                                                        value: "sudah-dibayar",
                                                                        label: "Sudah Dibayar",
                                                                    },
                                                                ].map(
                                                                    (
                                                                        paymentStatus,
                                                                        index,
                                                                    ) => (
                                                                        <MenuItem
                                                                            value={
                                                                                paymentStatus.value
                                                                            }
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {
                                                                                paymentStatus.label
                                                                            }
                                                                        </MenuItem>
                                                                    ),
                                                                )}
                                                            </Select>
                                                            {fieldState.error && (
                                                                <FormHelperText>
                                                                    {
                                                                        fieldState
                                                                            .error
                                                                            .message
                                                                    }
                                                                </FormHelperText>
                                                            )}
                                                        </FormControl>
                                                    </>
                                                );
                                            }}
                                        ></Controller>
                                        <div className="flex gap-[1rem]">
                                            <div className="flex w-[8.75rem] flex-col gap-[1rem]">
                                                <Controller
                                                    name="status"
                                                    control={form.control}
                                                    render={({
                                                        field,
                                                        fieldState,
                                                    }) => {
                                                        return (
                                                            <>
                                                                <InputLabel id="select-status-label">
                                                                    Status
                                                                </InputLabel>
                                                                <FormControl
                                                                    error={
                                                                        fieldState.invalid
                                                                    }
                                                                >
                                                                    <Select
                                                                        {...field}
                                                                        displayEmpty
                                                                        labelId="select-status-label"
                                                                        id="select-status"
                                                                        size="small"
                                                                        onChange={(
                                                                            event,
                                                                        ) => {
                                                                            field.onChange(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            );
                                                                        }}
                                                                        value={
                                                                            field.value ||
                                                                            ""
                                                                        }
                                                                    >
                                                                        <MenuItem
                                                                            disabled
                                                                            value=""
                                                                        >
                                                                            <em>
                                                                                Pilih
                                                                                Status
                                                                            </em>
                                                                        </MenuItem>
                                                                        {[
                                                                            {
                                                                                value: "baru",
                                                                                label: "Baru",
                                                                            },
                                                                            {
                                                                                value: "proses",
                                                                                label: "Proses",
                                                                            },
                                                                            {
                                                                                value: "selesai",
                                                                                label: "Selesai",
                                                                            },
                                                                            {
                                                                                value: "diambil",
                                                                                label: "Diambil",
                                                                            },
                                                                        ].map(
                                                                            (
                                                                                status,
                                                                                index,
                                                                            ) => (
                                                                                <MenuItem
                                                                                    value={
                                                                                        status.value
                                                                                    }
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        status.label
                                                                                    }
                                                                                </MenuItem>
                                                                            ),
                                                                        )}
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <FormHelperText>
                                                                            {
                                                                                fieldState
                                                                                    .error
                                                                                    .message
                                                                            }
                                                                        </FormHelperText>
                                                                    )}
                                                                </FormControl>
                                                            </>
                                                        );
                                                    }}
                                                ></Controller>
                                            </div>
                                            <div className="flex w-[8.75rem] flex-col gap-[1rem]">
                                                <Controller
                                                    name="qty"
                                                    control={form.control}
                                                    render={({
                                                        field,
                                                        fieldState,
                                                    }) => {
                                                        return (
                                                            <>
                                                                <InputLabel id="text-qty">
                                                                    Qty.
                                                                </InputLabel>
                                                                <TextField
                                                                    {...field}
                                                                    size="small"
                                                                    placeholder="Kuantitas"
                                                                    type="number"
                                                                    error={
                                                                        fieldState.invalid
                                                                    }
                                                                    helperText={
                                                                        fieldState
                                                                            .error
                                                                            ?.message
                                                                    }
                                                                />
                                                            </>
                                                        );
                                                    }}
                                                ></Controller>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 max-lg:w-[40rem]">
                                    <Controller
                                        name="price"
                                        control={form.control}
                                        render={({ field }) => {
                                            return (
                                                <>
                                                    <InputLabel id="text-total-charge">
                                                        Total Bayar
                                                    </InputLabel>
                                                    <TextField
                                                        {...field}
                                                        value={new Intl.NumberFormat(
                                                            "id-ID",
                                                            {
                                                                style: "currency",
                                                                currency: "IDR",
                                                                minimumFractionDigits: 0,
                                                            },
                                                        ).format(field.value)}
                                                        disabled
                                                        size="small"
                                                    />
                                                </>
                                            );
                                        }}
                                    ></Controller>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button
                                    variant="contained"
                                    className="w-[6.25rem]"
                                    type="submit"
                                >
                                    Simpan
                                </Button>
                                <Button
                                    variant="outlined"
                                    className="w-[6.25rem]"
                                    onClick={onClose}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default TransactionModal;

TransactionModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    transaction: PropTypes.object,
};
