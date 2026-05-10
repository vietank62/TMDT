'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import DataTable, { Column } from '@/components/common/DataTable'
import { mockUsers } from '@/data/users'
import { User, UserRole } from '@/types'
import { formatDate } from '@/lib/utils'

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: 'Người dùng',
  [UserRole.EXPERT]: 'Chuyên gia',
  [UserRole.ADMIN]: 'Admin',
}
const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.USER]: 'bg-gray-100 text-gray-700',
  [UserRole.EXPERT]: 'bg-blue-100 text-blue-700',
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-700',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')

  const filtered = mockUsers.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      label: 'Người dùng',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatarUrl} />
            <AvatarFallback>{row.fullName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.fullName}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Vai trò',
      render: (_, row) => (
        <div className="flex gap-1 flex-wrap">
          {row.roles.map((role) => (
            <span key={role} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tham gia',
      render: (v) => <span className="text-sm text-gray-500">{formatDate(String(v))}</span>,
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (v) => (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {v ? 'Hoạt động' : 'Bị khóa'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý người dùng</h1>
        <Badge variant="secondary">{filtered.length} người dùng</Badge>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-9" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filtered} emptyMessage="Không tìm thấy người dùng" />
        </CardContent>
      </Card>
    </div>
  )
}
