import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const API_URL = 'https://api.aralboyitexnikum.uz';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredUsers = users.filter(user =>
        user.ism.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.familiya.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (user) => {
        setEditingUser({...user});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingUser(null);
    };

    const handleSave = async () => {
        const updatedUser = {
            ism: editingUser.ism,
            familiya: editingUser.familiya,
            otasiningIsmi: editingUser.otasiningIsmi,
            tugilganSanasi: editingUser.tugilganSanasi,
            telefonRaqami: editingUser.telefonRaqami,
            qoshimchaRaqam: editingUser.qoshimchaRaqam,
            pasportSeriyaRaqami: editingUser.pasportSeriyaRaqami,
            yonalish: editingUser.yonalish,
            talimTuri: editingUser.talimTuri,
            dtmTestBali: editingUser.dtmTestBali,
            //source: editingUser.source
        };
    
        console.log('Yuborilayotgan ma\'lumotlar:', updatedUser);
    
        try {
            const response = await fetch(`${API_URL}/users/${editingUser._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                fetchUsers();
                handleClose();
                alert('Foydalanuvchi ma\'lumotlari muvaffaqiyatli yangilandi');
            } else {
                console.error('Server xatosi:', data);
                let errorMessage = 'Xatolik yuz berdi: ';
                if (data.error) {
                    errorMessage += data.error;
                }
                if (data.invalidUpdates) {
                    errorMessage += ` Noto'g'ri yangilanishlar: ${data.invalidUpdates.join(', ')}`;
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Xatolik:', error);
            alert('Serverga ulanishda xatolik: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Haqiqatan ham bu foydalanuvchini o\'chirmoqchimisiz?')) {
            try {
                const response = await fetch(`${API_URL}/users/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchUsers();
                    alert('Foydalanuvchi muvaffaqiyatli o\'chirildi');
                } else {
                    alert('Xatolik yuz berdi');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Serverga ulanishda xatolik');
            }
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(
            filteredUsers.map((user, index) => ({
                'No': index + 1,
                'Ism': user.ism,
                'Familiya': user.familiya,
                'Otasining Ismi': user.otasiningIsmi,
                'Tug\'ilgan Sanasi': user.tugilganSanasi,
                'Telefon Raqami': user.telefonRaqami,
                'Qo\'shimcha Raqam': user.qoshimchaRaqam,
                'Pasport Seriya Raqami': user.pasportSeriyaRaqami,
                'Yo\'nalish': user.yonalish,
                'Ta\'lim Turi': user.talimTuri,
                'DTM Test Bali': user.dtmTestBali,
                'Manba': user.source === 'telegram' ? 'Telegram Bot' : 'Web Site'
            }))
        );

        const columnWidths = [
            { wch: 5 },  // No
            { wch: 20 }, // Ism
            { wch: 20 }, // Familiya
            { wch: 20 }, // Otasining Ismi
            { wch: 10 }, // Tug'ilgan Sanasi
            { wch: 15 }, // Telefon Raqami
            { wch: 15 }, // Qo'shimcha Raqam
            { wch: 15 }, // Pasport Seriya Raqami
            { wch: 30 }, // Yo'nalish
            { wch: 20 }, // Ta'lim Turi
            { wch: 5 }, // DTM Test Bali
            { wch: 15 }, // Manba
        ];
        worksheet['!cols'] = columnWidths;

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!worksheet[address]) continue;
            worksheet[address].s = {
                fill: { fgColor: { rgb: "4287F5" } },
                font: { color: { rgb: "FFFFFF" }, bold: true }
            };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Foydalanuvchilar');
        
        const excelFileName = 'RoyxatAralBoyi.xlsx';
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(data, excelFileName);
        } else {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(data);
            link.setAttribute('download', excelFileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            <Button onClick={handleLogout}>Chiqish</Button>
            <TextField
                label="Qidirish"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                margin="normal"
            />
            <Button onClick={exportToExcel} variant="contained" color="primary" style={{ marginLeft: '10px' }}>
                Excel ga eksport
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Ism</TableCell>
                            <TableCell>Familiya</TableCell>
                            <TableCell>Otasining Ismi</TableCell>
                            <TableCell>Tug'ilgan Sanasi</TableCell>
                            <TableCell>Telefon Raqami</TableCell>
                            <TableCell>Qo'shimcha Raqam</TableCell>
                            <TableCell>Pasport Seriya Raqami</TableCell>
                            <TableCell>Yo'nalish</TableCell>
                            <TableCell>Ta'lim Turi</TableCell>
                            <TableCell>DTM Test Bali</TableCell>
                            <TableCell>Manba</TableCell>
                            <TableCell>Amallar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user, index) => (
                            <TableRow key={user._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ism}</TableCell>
                                <TableCell>{user.familiya}</TableCell>
                                <TableCell>{user.otasiningIsmi}</TableCell>
                                <TableCell>{user.tugilganSanasi}</TableCell>
                                <TableCell>{user.telefonRaqami}</TableCell>
                                <TableCell>{user.qoshimchaRaqam}</TableCell>
                                <TableCell>{user.pasportSeriyaRaqami}</TableCell>
                                <TableCell>{user.yonalish}</TableCell>
                                <TableCell>{user.talimTuri}</TableCell>
                                <TableCell>{user.dtmTestBali}</TableCell>
                                <TableCell>{user.source === 'telegram' ? 'Telegram Bot' : 'Web Site'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit(user)}>Tahrirlash</Button>
                                    <Button onClick={() => handleDelete(user._id)}>O'chirish</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Foydalanuvchini Tahrirlash</DialogTitle>
                <DialogContent>
                    {editingUser && (
                        <>
                            <TextField
                                label="Ism"
                                value={editingUser.ism}
                                onChange={(e) => setEditingUser({...editingUser, ism: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Familiya"
                                value={editingUser.familiya}
                                onChange={(e) => setEditingUser({...editingUser, familiya: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Otasining Ismi"
                                value={editingUser.otasiningIsmi}
                                onChange={(e) => setEditingUser({...editingUser, otasiningIsmi: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Tug'ilgan Sanasi"
                                value={editingUser.tugilganSanasi}
                                onChange={(e) => setEditingUser({...editingUser, tugilganSanasi: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Telefon Raqami"
                                value={editingUser.telefonRaqami}
                                onChange={(e) => setEditingUser({...editingUser, telefonRaqami: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Qo'shimcha Raqam"
                                value={editingUser.qoshimchaRaqam}
                                onChange={(e) => setEditingUser({...editingUser, qoshimchaRaqam: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Pasport Seriya Raqami"
                                value={editingUser.pasportSeriyaRaqami}
                                onChange={(e) => setEditingUser({...editingUser, pasportSeriyaRaqami: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Yo'nalish"
                                value={editingUser.yonalish}
                                onChange={(e) => setEditingUser({...editingUser, yonalish: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Ta'lim Turi"
                                value={editingUser.talimTuri}
                                onChange={(e) => setEditingUser({...editingUser, talimTuri: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="DTM Test Bali"
                                value={editingUser.dtmTestBali}
                                onChange={(e) => setEditingUser({...editingUser, dtmTestBali: e.target.value})}
                                fullWidth
                                margin="normal"
                            />
                         
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Bekor qilish</Button>
                    <Button onClick={handleSave}>Saqlash</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Admin;
